import aws from "aws-sdk";
import process from "process";
import { join } from "path";
import { writeFileSync, existsSync, readFileSync } from "fs";
import { updateAWSCredentials } from "../src/update-aws-credentials";

describe("Update aws credentials", () => {
  it("with profile", async () => {
    const dotEnvFile = join(process.cwd(), ".env");
    //@ts-ignore
    aws.setKeys({
      AccessKeyIdValue: "key",
      SecretAccessKeyValue: "secret",
      SessionTokenValue: "token",
    });
    writeFileSync(
      dotEnvFile,
      `AWS_ACCESS_KEY_ID="ASIA3SGQNTYDDFJPYCNA"
AWS_SECRET_ACCESS_KEY="TZnnmsmsYseyC5io9hJIkCxh13mqwYWa/vaetnMo"
AWS_SESSION_TOKEN="FwoGZXIvYXdzEAcaDIHwLivlg2VGUaqINyKGAUBAWZoV96oA2yeSe9kQSEg7OSkHdVwn5FPJ5s/GiNTCZ+o/srvYIEWeuDwOhHzfRWmIbcmmFHlRuKoySLMx8Jg2tEUUbZTuYmpbBWS/9tdgGuNhSy/mKlvYiNipsdL13/6EhLG8A47arV9R9ysVNWPpUV2Q3Cx7G1CzqrH6hDEZvFE2l9HOKJSO/vAFMijQE/ASeQF8u0ycr/8U+VK2LtCw5VMIxM6YIVhSzzhVcbZOw4yiUiJa"
TEST=true
DOUBLE_QUOTES="I am a string"`,
      {
        encoding: "utf-8",
      }
    );

    await updateAWSCredentials({
      account: "1234",
      profile: "cabiri",
      token: "token",
      user: "kamil@cabiri.io",
      sessionDuration: "3600",
    });

    //@ts-ignore
    expect(aws.config.credentials.values).toEqual({ profile: "cabiri" });
    expect(existsSync(dotEnvFile)).toBeTruthy();
    expect(readFileSync(dotEnvFile, { encoding: "utf-8" }))
      .toBe(`AWS_ACCESS_KEY_ID=key
AWS_SECRET_ACCESS_KEY=secret
AWS_SESSION_TOKEN=token
TEST=true
DOUBLE_QUOTES="I am a string"
DAM_USER=kamil@cabiri.io
DAM_ACCOUNT=1234
DAM_PROFILE=cabiri`);
  });

  it("with default profile", async () => {
    const dotEnvFile = join(process.cwd(), ".env");
    //@ts-ignore
    aws.setKeys({
      AccessKeyIdValue: "key",
      SecretAccessKeyValue: "secret",
      SessionTokenValue: "token",
    });
    writeFileSync(
      dotEnvFile,
      `AWS_ACCESS_KEY_ID="ASIA3SGQNTYDDFJPYCNA"
AWS_SECRET_ACCESS_KEY="TZnnmsmsYseyC5io9hJIkCxh13mqwYWa/vaetnMo"
AWS_SESSION_TOKEN="FwoGZXIvYXdzEAcaDIHwLivlg2VGUaqINyKGAUBAWZoV96oA2yeSe9kQSEg7OSkHdVwn5FPJ5s/GiNTCZ+o/srvYIEWeuDwOhHzfRWmIbcmmFHlRuKoySLMx8Jg2tEUUbZTuYmpbBWS/9tdgGuNhSy/mKlvYiNipsdL13/6EhLG8A47arV9R9ysVNWPpUV2Q3Cx7G1CzqrH6hDEZvFE2l9HOKJSO/vAFMijQE/ASeQF8u0ycr/8U+VK2LtCw5VMIxM6YIVhSzzhVcbZOw4yiUiJa"
TEST=true
DOUBLE_QUOTES="I am a string"`,
      {
        encoding: "utf-8",
      }
    );

    await updateAWSCredentials({
      account: "1234",
      token: "token",
      user: "kamil@cabiri.io",
      sessionDuration: "3600",
    });

    //@ts-ignore
    expect(aws.config.credentials.values).toEqual({ profile: "default" });
    expect(existsSync(dotEnvFile)).toBeTruthy();
    expect(readFileSync(dotEnvFile, { encoding: "utf-8" }))
      .toBe(`AWS_ACCESS_KEY_ID=key
AWS_SECRET_ACCESS_KEY=secret
AWS_SESSION_TOKEN=token
TEST=true
DOUBLE_QUOTES="I am a string"
DAM_USER=kamil@cabiri.io
DAM_ACCOUNT=1234
DAM_PROFILE=default`);
  });
});
