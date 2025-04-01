const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        const ccpPath = path.resolve(__dirname, '../network/connection-Rbi.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for "appUser" does not exist in the wallet');
            return;
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('lendingChaincode');


        console.log('Submitting transaction: RequestLoan...');
        const loanId = 'LOAN' + Math.random().toString(36).substr(2, 9);
        const borrowerId = 'BORROWER001';
        const amount = 5000;
        const interestRate = 7.5;
        const duration = 12;
        
        await contract.submitTransaction(
            'RequestLoan', 
            loanId, 
            borrowerId, 
            amount.toString(), 
            interestRate.toString(), 
            duration.toString()
        );
        console.log('Loan request submitted successfully.');


        console.log('Approving Loan...');
        const lenderId = 'LENDER001';
        await contract.submitTransaction(
            'ApproveLoan', 
            loanId, 
            lenderId
        );
        console.log('Loan approved successfully.');

        
        console.log('Repaying Loan...');
        const repaymentAmount = 1000;
        await contract.submitTransaction(
            'RepayLoan', 
            loanId, 
            repaymentAmount.toString()
        );
        console.log('Loan repayment made successfully.');

        
        console.log('Querying loan details...');
        const result = await contract.evaluateTransaction(
            'QueryLoan', 
            loanId
        );
        const loanDetails = JSON.parse(result.toString());
        console.log('Loan details:');
        console.log(`Loan ID: ${loanDetails.LoanID}`);
        console.log(`Borrower: ${loanDetails.BorrowerID}`);
        console.log(`Lender: ${loanDetails.LenderID}`);
        console.log(`Amount: ${loanDetails.Amount}`);
        console.log(`Status: ${loanDetails.Status}`);
        console.log(`Remaining Balance: ${loanDetails.RemainingBalance}`);
        console.log('Loan details fetched successfully.');

        await gateway.disconnect();
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

main();
