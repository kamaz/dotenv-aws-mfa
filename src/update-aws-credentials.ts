import aws, { STS } from "aws-sdk";
import { config } from "dotenv";
import { pickAll } from "ramda";
import { writeFileSync } from "fs";
import { join as joinPath } from "path";
import os from "os";
import { debug } from "./debug";

export type Authentication = {
  account: string;
  user: string;
  token: string;
  profile?: string;
  role?: string;
  sessionDuration: string;
};

const quote = /[\s"']/

type StringifyPair = [
  key: string,
  value: string
]

const stringifyPair = (values: StringifyPair) => {
  const [key, val] = values
  let strval = ''
  switch (typeof val) {
    case 'string':
      try {
        JSON.parse(val)
        strval = val
      } catch (e) {
        strval = quote.test(val) ? JSON.stringify(val) : val
      }
      break
    case 'boolean':
    case 'number':
      strval = String(val)
      break
    case 'undefined':
      strval = ''
      break
    case 'object':
      if (val !== null) {
        strval = JSON.stringify(val)
      }
      break
  }
  return `${key}=${strval}`
}


const getCredentials = async (
  authentication: Authentication
): Promise<STS.Credentials | undefined> => {
  const {
    account,
    user,
    token,
    profile = "default",
    role = "",
    sessionDuration,
  } = authentication;
  const credentials = new aws.SharedIniFileCredentials({
    profile,
  });
  aws.config.credentials = credentials;
  const sts = new STS();
  const sessionTokenPayload = {
    DurationSeconds: 43200,
    SerialNumber: `arn:aws:iam::${account}:mfa/${user}`,
    TokenCode: token,
  };
  if (role && role != "") {
    const assumeRoleToken = await sts
      .assumeRole({
        ...sessionTokenPayload,
        // todo: that value can be configured
        DurationSeconds: parseInt(sessionDuration, 10) ?? 3600,
        RoleArn: role,
        RoleSessionName: `${account}-${user}`,
      })
      .promise();
    debug("assume role token response %j", assumeRoleToken);
    return assumeRoleToken.Credentials;
  }

  const tokenResponse = await sts
    .getSessionToken(sessionTokenPayload)
    .promise();

  debug("session token response %j", tokenResponse);
  return tokenResponse.Credentials;
};

export const updateAWSCredentials = async (authentication: Authentication) => {
  const { account, user, profile = "default" } = authentication;
  const credentials = await getCredentials(authentication);

  const awsAccessValues = pickAll(
    ["AccessKeyId", "SecretAccessKey", "SessionToken"],
    credentials
  ) as { AccessKeyId: string; SecretAccessKey: string; SessionToken: string };

  const dotEnvValues = config().parsed || {};

  const newDotEnvValues = {
    ...dotEnvValues,
    AWS_ACCESS_KEY_ID: awsAccessValues.AccessKeyId,
    AWS_SECRET_ACCESS_KEY: awsAccessValues.SecretAccessKey,
    AWS_SESSION_TOKEN: awsAccessValues.SessionToken,
    DAM_USER: user,
    DAM_ACCOUNT: account,
    DAM_PROFILE: profile,
  };

  const newDotValuesStringify = Object.entries(newDotEnvValues).map((value) => stringifyPair(value)).join(os.EOL)


  writeFileSync(joinPath(process.cwd(), ".env"), newDotValuesStringify, {
    encoding: "utf-8",
  });


};
