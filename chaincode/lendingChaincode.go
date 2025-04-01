package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Loan struct represents a loan request
type Loan struct {
	LoanID           string  `json:"loanId"`
	BorrowerID       string  `json:"borrowerId"`
	LenderID         string  `json:"lenderId"`
	Amount           float64 `json:"amount"`
	InterestRate     float64 `json:"interestRate"`
	Duration         int     `json:"duration"`
	Status           string  `json:"status"` // Pending, Approved, Active, Repaid, Defaulted
	DisbursementDate string  `json:"disbursementDate"`
	RepaymentDue     float64 `json:"repaymentDue"`
	RemainingBalance float64 `json:"remainingBalance"`
	Defaulted        bool    `json:"defaulted"`
}

// SmartContract provides functions for managing loans
type SmartContract struct {
	contractapi.Contract
}

func (s *SmartContract) RequestLoan(ctx contractapi.TransactionContextInterface, loanID, borrowerID string, amount float64, interestRate float64, duration int) error {
	existing, err := ctx.GetStub().GetState(loanID)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if existing != nil {
		return fmt.Errorf("loan with ID %s already exists", loanID)
	}

	if amount <= 0 {
		return fmt.Errorf("loan amount must be positive")
	}
	if interestRate <= 0 {
		return fmt.Errorf("interest rate must be positive")
	}
	if duration <= 0 {
		return fmt.Errorf("loan duration must be positive")
	}

	totalRepayment := amount * (1 + (interestRate/100)*float64(duration)/12)

	loan := Loan{
		LoanID:           loanID,
		BorrowerID:       borrowerID,
		Amount:           amount,
		InterestRate:     interestRate,
		Duration:         duration,
		Status:           "Pending",
		RepaymentDue:     totalRepayment,
		RemainingBalance: totalRepayment,
		Defaulted:        false,
	}

	loanJSON, err := json.Marshal(loan)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(loanID, loanJSON)
}

func (s *SmartContract) ApproveLoan(ctx contractapi.TransactionContextInterface, loanID, lenderID string) error {
	loanJSON, err := ctx.GetStub().GetState(loanID)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if loanJSON == nil {
		return fmt.Errorf("loan with ID %s does not exist", loanID)
	}

	var loan Loan
	err = json.Unmarshal(loanJSON, &loan)
	if err != nil {
		return fmt.Errorf("failed to unmarshal loan data: %v", err)
	}

	if loan.Status != "Pending" {
		return fmt.Errorf("loan is not in pending state")
	}

	loan.LenderID = lenderID
	loan.Status = "Approved"
	// loan.DisbursementDate = time.Now().Format(time.RFC3339)

	updatedLoanJSON, err := json.Marshal(loan)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(loanID, updatedLoanJSON)
}

func (s *SmartContract) RepayLoan(ctx contractapi.TransactionContextInterface, loanID string, amount float64) error {
	if amount <= 0 {
		return fmt.Errorf("repayment amount must be positive")
	}

	loanJSON, err := ctx.GetStub().GetState(loanID)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if loanJSON == nil {
		return fmt.Errorf("loan with ID %s does not exist", loanID)
	}

	var loan Loan
	err = json.Unmarshal(loanJSON, &loan)
	if err != nil {
		return fmt.Errorf("failed to unmarshal loan data: %v", err)
	}

	if loan.Status != "Approved" && loan.Status != "Active" {
		return fmt.Errorf("loan is not in a repayable state")
	}

	loan.RemainingBalance -= amount

	if loan.RemainingBalance <= 0 {
		loan.Status = "Repaid"
		loan.RemainingBalance = 0
	} else {
		loan.Status = "Active"
	}

	updatedLoanJSON, err := json.Marshal(loan)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(loanID, updatedLoanJSON)
}

func (s *SmartContract) QueryLoan(ctx contractapi.TransactionContextInterface, loanID string) (*Loan, error) {
	loanJSON, err := ctx.GetStub().GetState(loanID)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if loanJSON == nil {
		return nil, fmt.Errorf("loan with ID %s does not exist", loanID)
	}

	var loan Loan
	err = json.Unmarshal(loanJSON, &loan)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal loan data: %v", err)
	}

	return &loan, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating chaincode: %v", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting chaincode: %v", err)
	}
}
