/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable @typescript-eslint/no-var-requires */

describe('Config values', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(async () => {
        jest.resetModules();
        process.env = { ...ORIGINAL_ENV };
    });

    afterAll(() => {
        process.env = { ...ORIGINAL_ENV };
    });

    describe('logLevel', () => {
        it('defaults to "info"', () => {
            const config = require('./config');
            expect(config.logLevel).toBe('info');
        });

        it('can be configured using the "LOG_LEVEL" environment variable', () => {
            process.env.LOG_LEVEL = 'debug';
            const config = require('./config');
            expect(config.logLevel).toBe('debug');
        });

        it('throws an error when the "LOG_LEVEL" environment variable has an invalid log level', () => {
            process.env.LOG_LEVEL = 'ludicrous';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "LOG_LEVEL" should be one of [fatal, error, warn, info, debug, trace, silent]'
            );
        });
    });

    describe('port', () => {
        it('defaults to "3000"', () => {
            const config = require('./config');
            expect(config.port).toBe(3000);
        });

        it('can be configured using the "PORT" environment variable', () => {
            process.env.PORT = '8000';
            const config = require('./config');
            expect(config.port).toBe(8000);
        });

        it('throws an error when the "PORT" environment variable has an invalid port number', () => {
            process.env.PORT = '65536';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "PORT" cannot assign a port number greater than 65535. An example of a valid value would be: 3000'
            );
        });
    });

    describe('submitJobBackoffType', () => {
        it('defaults to "fixed"', () => {
            const config = require('./config');
            expect(config.submitJobBackoffType).toBe('fixed');
        });

        it('can be configured using the "SUBMIT_JOB_BACKOFF_TYPE" environment variable', () => {
            process.env.SUBMIT_JOB_BACKOFF_TYPE = 'exponential';
            const config = require('./config');
            expect(config.submitJobBackoffType).toBe('exponential');
        });

        it('throws an error when the "LOG_LEVEL" environment variable has an invalid log level', () => {
            process.env.SUBMIT_JOB_BACKOFF_TYPE = 'jitter';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "SUBMIT_JOB_BACKOFF_TYPE" should be one of [fixed, exponential]'
            );
        });
    });

    describe('submitJobBackoffDelay', () => {
        it('defaults to "3000"', () => {
            const config = require('./config');
            expect(config.submitJobBackoffDelay).toBe(3000);
        });

        it('can be configured using the "SUBMIT_JOB_BACKOFF_DELAY" environment variable', () => {
            process.env.SUBMIT_JOB_BACKOFF_DELAY = '9999';
            const config = require('./config');
            expect(config.submitJobBackoffDelay).toBe(9999);
        });

        it('throws an error when the "SUBMIT_JOB_BACKOFF_DELAY" environment variable has an invalid number', () => {
            process.env.SUBMIT_JOB_BACKOFF_DELAY = 'short';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "SUBMIT_JOB_BACKOFF_DELAY" should be a valid integer. An example of a valid value would be: 3000'
            );
        });
    });

    describe('submitJobAttempts', () => {
        it('defaults to "5"', () => {
            const config = require('./config');
            expect(config.submitJobAttempts).toBe(5);
        });

        it('can be configured using the "SUBMIT_JOB_ATTEMPTS" environment variable', () => {
            process.env.SUBMIT_JOB_ATTEMPTS = '9999';
            const config = require('./config');
            expect(config.submitJobAttempts).toBe(9999);
        });

        it('throws an error when the "SUBMIT_JOB_ATTEMPTS" environment variable has an invalid number', () => {
            process.env.SUBMIT_JOB_ATTEMPTS = 'lots';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "SUBMIT_JOB_ATTEMPTS" should be a valid integer. An example of a valid value would be: 5'
            );
        });
    });

    describe('submitJobConcurrency', () => {
        it('defaults to "5"', () => {
            const config = require('./config');
            expect(config.submitJobConcurrency).toBe(5);
        });

        it('can be configured using the "SUBMIT_JOB_CONCURRENCY" environment variable', () => {
            process.env.SUBMIT_JOB_CONCURRENCY = '9999';
            const config = require('./config');
            expect(config.submitJobConcurrency).toBe(9999);
        });

        it('throws an error when the "SUBMIT_JOB_CONCURRENCY" environment variable has an invalid number', () => {
            process.env.SUBMIT_JOB_CONCURRENCY = 'lots';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "SUBMIT_JOB_CONCURRENCY" should be a valid integer. An example of a valid value would be: 5'
            );
        });
    });

    describe('maxCompletedSubmitJobs', () => {
        it('defaults to "1000"', () => {
            const config = require('./config');
            expect(config.maxCompletedSubmitJobs).toBe(1000);
        });

        it('can be configured using the "MAX_COMPLETED_SUBMIT_JOBS" environment variable', () => {
            process.env.MAX_COMPLETED_SUBMIT_JOBS = '9999';
            const config = require('./config');
            expect(config.maxCompletedSubmitJobs).toBe(9999);
        });

        it('throws an error when the "MAX_COMPLETED_SUBMIT_JOBS" environment variable has an invalid number', () => {
            process.env.MAX_COMPLETED_SUBMIT_JOBS = 'lots';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "MAX_COMPLETED_SUBMIT_JOBS" should be a valid integer. An example of a valid value would be: 1000'
            );
        });
    });

    describe('maxFailedSubmitJobs', () => {
        it('defaults to "1000"', () => {
            const config = require('./config');
            expect(config.maxFailedSubmitJobs).toBe(1000);
        });

        it('can be configured using the "MAX_FAILED_SUBMIT_JOBS" environment variable', () => {
            process.env.MAX_FAILED_SUBMIT_JOBS = '9999';
            const config = require('./config');
            expect(config.maxFailedSubmitJobs).toBe(9999);
        });

        it('throws an error when the "MAX_FAILED_SUBMIT_JOBS" environment variable has an invalid number', () => {
            process.env.MAX_FAILED_SUBMIT_JOBS = 'lots';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "MAX_FAILED_SUBMIT_JOBS" should be a valid integer. An example of a valid value would be: 1000'
            );
        });
    });

    describe('submitJobQueueScheduler', () => {
        it('defaults to "true"', () => {
            const config = require('./config');
            expect(config.submitJobQueueScheduler).toBe(true);
        });

        it('can be configured using the "SUBMIT_JOB_QUEUE_SCHEDULER" environment variable', () => {
            process.env.SUBMIT_JOB_QUEUE_SCHEDULER = 'false';
            const config = require('./config');
            expect(config.submitJobQueueScheduler).toBe(false);
        });

        it('throws an error when the "SUBMIT_JOB_QUEUE_SCHEDULER" environment variable has an invalid boolean value', () => {
            process.env.SUBMIT_JOB_QUEUE_SCHEDULER = '11';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "SUBMIT_JOB_QUEUE_SCHEDULER" should be either "true", "false", "TRUE", or "FALSE". An example of a valid value would be: true'
            );
        });
    });

    describe('asLocalhost', () => {
        it('defaults to "true"', () => {
            const config = require('./config');
            expect(config.asLocalhost).toBe(true);
        });

        it('can be configured using the "AS_LOCAL_HOST" environment variable', () => {
            process.env.AS_LOCAL_HOST = 'false';
            const config = require('./config');
            expect(config.asLocalhost).toBe(false);
        });

        it('throws an error when the "AS_LOCAL_HOST" environment variable has an invalid boolean value', () => {
            process.env.AS_LOCAL_HOST = '11';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "AS_LOCAL_HOST" should be either "true", "false", "TRUE", or "FALSE". An example of a valid value would be: true'
            );
        });
    });

    describe('mspIdRbi', () => {
        it('defaults to "RbiMSP"', () => {
            const config = require('./config');
            expect(config.mspIdRbi).toBe('RbiMSP');
        });

        it('can be configured using the "HLF_MSP_ID_Rbi" environment variable', () => {
            process.env.HLF_MSP_ID_Rbi = 'Test1MSP';
            const config = require('./config');
            expect(config.mspIdRbi).toBe('Test1MSP');
        });
    });

    describe('mspIdHdfc', () => {
        it('defaults to "HdfcMSP"', () => {
            const config = require('./config');
            expect(config.mspIdHdfc).toBe('HdfcMSP');
        });

        it('can be configured using the "HLF_MSP_ID_Hdfc" environment variable', () => {
            process.env.HLF_MSP_ID_Hdfc = 'Test2MSP';
            const config = require('./config');
            expect(config.mspIdHdfc).toBe('Test2MSP');
        });
    });

    describe('channelName', () => {
        it('defaults to "mychannel"', () => {
            const config = require('./config');
            expect(config.channelName).toBe('mychannel');
        });

        it('can be configured using the "HLF_CHANNEL_NAME" environment variable', () => {
            process.env.HLF_CHANNEL_NAME = 'testchannel';
            const config = require('./config');
            expect(config.channelName).toBe('testchannel');
        });
    });

    describe('chaincodeName', () => {
        it('defaults to "basic"', () => {
            const config = require('./config');
            expect(config.chaincodeName).toBe('basic');
        });

        it('can be configured using the "HLF_CHAINCODE_NAME" environment variable', () => {
            process.env.HLF_CHAINCODE_NAME = 'testcc';
            const config = require('./config');
            expect(config.chaincodeName).toBe('testcc');
        });
    });

    describe('commitTimeout', () => {
        it('defaults to "300"', () => {
            const config = require('./config');
            expect(config.commitTimeout).toBe(300);
        });

        it('can be configured using the "HLF_COMMIT_TIMEOUT" environment variable', () => {
            process.env.HLF_COMMIT_TIMEOUT = '9999';
            const config = require('./config');
            expect(config.commitTimeout).toBe(9999);
        });

        it('throws an error when the "HLF_COMMIT_TIMEOUT" environment variable has an invalid number', () => {
            process.env.HLF_COMMIT_TIMEOUT = 'short';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "HLF_COMMIT_TIMEOUT" should be a valid integer. An example of a valid value would be: 300'
            );
        });
    });

    describe('endorseTimeout', () => {
        it('defaults to "30"', () => {
            const config = require('./config');
            expect(config.endorseTimeout).toBe(30);
        });

        it('can be configured using the "HLF_ENDORSE_TIMEOUT" environment variable', () => {
            process.env.HLF_ENDORSE_TIMEOUT = '9999';
            const config = require('./config');
            expect(config.endorseTimeout).toBe(9999);
        });

        it('throws an error when the "HLF_ENDORSE_TIMEOUT" environment variable has an invalid number', () => {
            process.env.HLF_ENDORSE_TIMEOUT = 'short';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "HLF_ENDORSE_TIMEOUT" should be a valid integer. An example of a valid value would be: 30'
            );
        });
    });

    describe('queryTimeout', () => {
        it('defaults to "3"', () => {
            const config = require('./config');
            expect(config.queryTimeout).toBe(3);
        });

        it('can be configured using the "HLF_QUERY_TIMEOUT" environment variable', () => {
            process.env.HLF_QUERY_TIMEOUT = '9999';
            const config = require('./config');
            expect(config.queryTimeout).toBe(9999);
        });

        it('throws an error when the "HLF_QUERY_TIMEOUT" environment variable has an invalid number', () => {
            process.env.HLF_QUERY_TIMEOUT = 'long';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "HLF_QUERY_TIMEOUT" should be a valid integer. An example of a valid value would be: 3'
            );
        });
    });

    describe('connectionProfileRbi', () => {
        it('throws an error when the "HLF_CONNECTION_PROFILE_Rbi" environment variable is not set', () => {
            delete process.env.HLF_CONNECTION_PROFILE_Rbi;
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "HLF_CONNECTION_PROFILE_Rbi" is a required variable, but it was not set. An example of a valid value would be: {"name":"test-network-Rbi","version":"1.0.0","client":{"organization":"Rbi" ... }'
            );
        });

        it('can be configured using the "HLF_CONNECTION_PROFILE_Rbi" environment variable', () => {
            process.env.HLF_CONNECTION_PROFILE_Rbi =
                '{"name":"test-network-Rbi"}';
            const config = require('./config');
            expect(config.connectionProfileRbi).toStrictEqual({
                name: 'test-network-Rbi',
            });
        });

        it('throws an error when the "HLF_CONNECTION_PROFILE_Rbi" environment variable is set to invalid json', () => {
            process.env.HLF_CONNECTION_PROFILE_Rbi = 'testing';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "HLF_CONNECTION_PROFILE_Rbi" should be valid (parseable) JSON. An example of a valid value would be: {"name":"test-network-Rbi","version":"1.0.0","client":{"organization":"Rbi" ... }'
            );
        });
    });

    describe('certificateRbi', () => {
        it('throws an error when the "HLF_CERTIFICATE_Rbi" environment variable is not set', () => {
            delete process.env.HLF_CERTIFICATE_Rbi;
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "HLF_CERTIFICATE_Rbi" is a required variable, but it was not set. An example of a valid value would be: "-----BEGIN CERTIFICATE-----\\n...\\n-----END CERTIFICATE-----\\n"'
            );
        });

        it('can be configured using the "HLF_CERTIFICATE_Rbi" environment variable', () => {
            process.env.HLF_CERTIFICATE_Rbi = 'RbiCERT';
            const config = require('./config');
            expect(config.certificateRbi).toBe('RbiCERT');
        });
    });

    describe('privateKeyRbi', () => {
        it('throws an error when the "HLF_PRIVATE_KEY_Rbi" environment variable is not set', () => {
            delete process.env.HLF_PRIVATE_KEY_Rbi;
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "HLF_PRIVATE_KEY_Rbi" is a required variable, but it was not set. An example of a valid value would be: "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"'
            );
        });

        it('can be configured using the "HLF_PRIVATE_KEY_Rbi" environment variable', () => {
            process.env.HLF_PRIVATE_KEY_Rbi = 'RbiPK';
            const config = require('./config');
            expect(config.privateKeyRbi).toBe('RbiPK');
        });
    });

    describe('connectionProfileHdfc', () => {
        it('throws an error when the "HLF_CONNECTION_PROFILE_Hdfc" environment variable is not set', () => {
            delete process.env.HLF_CONNECTION_PROFILE_Hdfc;
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "HLF_CONNECTION_PROFILE_Hdfc" is a required variable, but it was not set. An example of a valid value would be: {"name":"test-network-Hdfc","version":"1.0.0","client":{"organization":"Hdfc" ... }'
            );
        });

        it('can be configured using the "HLF_CONNECTION_PROFILE_Hdfc" environment variable', () => {
            process.env.HLF_CONNECTION_PROFILE_Hdfc =
                '{"name":"test-network-Hdfc"}';
            const config = require('./config');
            expect(config.connectionProfileHdfc).toStrictEqual({
                name: 'test-network-Hdfc',
            });
        });

        it('throws an error when the "HLF_CONNECTION_PROFILE_Hdfc" environment variable is set to invalid json', () => {
            process.env.HLF_CONNECTION_PROFILE_Hdfc = 'testing';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "HLF_CONNECTION_PROFILE_Hdfc" should be valid (parseable) JSON. An example of a valid value would be: {"name":"test-network-Hdfc","version":"1.0.0","client":{"organization":"Hdfc" ... }'
            );
        });
    });

    describe('certificateHdfc', () => {
        it('throws an error when the "HLF_CERTIFICATE_Hdfc" environment variable is not set', () => {
            delete process.env.HLF_CERTIFICATE_Hdfc;
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "HLF_CERTIFICATE_Hdfc" is a required variable, but it was not set. An example of a valid value would be: "-----BEGIN CERTIFICATE-----\\n...\\n-----END CERTIFICATE-----\\n"'
            );
        });

        it('can be configured using the "HLF_CERTIFICATE_Hdfc" environment variable', () => {
            process.env.HLF_CERTIFICATE_Hdfc = 'HdfcCERT';
            const config = require('./config');
            expect(config.certificateHdfc).toBe('HdfcCERT');
        });
    });

    describe('privateKeyHdfc', () => {
        it('throws an error when the "HLF_PRIVATE_KEY_Hdfc" environment variable is not set', () => {
            delete process.env.HLF_PRIVATE_KEY_Hdfc;
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "HLF_PRIVATE_KEY_Hdfc" is a required variable, but it was not set. An example of a valid value would be: "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"'
            );
        });

        it('can be configured using the "HLF_PRIVATE_KEY_Hdfc" environment variable', () => {
            process.env.HLF_PRIVATE_KEY_Hdfc = 'HdfcPK';
            const config = require('./config');
            expect(config.privateKeyHdfc).toBe('HdfcPK');
        });
    });

    describe('redisHost', () => {
        it('defaults to "localhost"', () => {
            const config = require('./config');
            expect(config.redisHost).toBe('localhost');
        });

        it('can be configured using the "REDIS_HOST" environment variable', () => {
            process.env.REDIS_HOST = 'redis.example.org';
            const config = require('./config');
            expect(config.redisHost).toBe('redis.example.org');
        });
    });

    describe('redisPort', () => {
        it('defaults to "6379"', () => {
            const config = require('./config');
            expect(config.redisPort).toBe(6379);
        });

        it('can be configured with a valid port number using the "REDIS_PORT" environment variable', () => {
            process.env.REDIS_PORT = '9736';
            const config = require('./config');
            expect(config.redisPort).toBe(9736);
        });

        it('throws an error when the "REDIS_PORT" environment variable has an invalid port number', () => {
            process.env.REDIS_PORT = '65536';
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "REDIS_PORT" cannot assign a port number greater than 65535. An example of a valid value would be: 6379'
            );
        });
    });

    describe('redisUsername', () => {
        it('has no default value', () => {
            const config = require('./config');
            expect(config.redisUsername).toBeUndefined();
        });

        it('can be configured using the "REDIS_USERNAME" environment variable', () => {
            process.env.REDIS_USERNAME = 'test';
            const config = require('./config');
            expect(config.redisUsername).toBe('test');
        });
    });

    describe('redisPassword', () => {
        it('has no default value', () => {
            const config = require('./config');
            expect(config.redisPassword).toBeUndefined();
        });

        it('can be configured using the "REDIS_PASSWORD" environment variable', () => {
            process.env.REDIS_PASSWORD = 'testpw';
            const config = require('./config');
            expect(config.redisPassword).toBe('testpw');
        });
    });

    describe('RbiApiKey', () => {
        it('throws an error when the "Rbi_APIKEY" environment variable is not set', () => {
            delete process.env.Rbi_APIKEY;
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "Rbi_APIKEY" is a required variable, but it was not set. An example of a valid value would be: 123'
            );
        });

        it('can be configured using the "Rbi_APIKEY" environment variable', () => {
            process.env.Rbi_APIKEY = 'RbiApiKey';
            const config = require('./config');
            expect(config.RbiApiKey).toBe('RbiApiKey');
        });
    });

    describe('HdfcApiKey', () => {
        it('throws an error when the "Rbi_APIKEY" environment variable is not set', () => {
            delete process.env.Hdfc_APIKEY;
            expect(() => {
                require('./config');
            }).toThrow(
                'env-var: "Hdfc_APIKEY" is a required variable, but it was not set. An example of a valid value would be: 456'
            );
        });

        it('can be configured using the "Rbi_APIKEY" environment variable', () => {
            process.env.Hdfc_APIKEY = 'HdfcApiKey';
            const config = require('./config');
            expect(config.HdfcApiKey).toBe('HdfcApiKey');
        });
    });
});
