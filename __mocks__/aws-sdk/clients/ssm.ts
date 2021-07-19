// This file only export the mock the right way. The real mock is in ./ssmMock
import { SSM } from "./ssmMock";

/*
 * We can't use export default here because the lib @middy/ssm use const SSM = require('aws-sdk/clients/ssm');
 *
 * With `module.exports = SSMClass;`
 * SSM = SSMClass in @middy/ssm
 * and `new SSM()` succeeds
 *
 * With `export default SSMClass;`
 * SSM = {
 *  default: SSMClass
 * }
 * and `new SSM()` fails
 */
module.exports = SSM;
