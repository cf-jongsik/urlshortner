"use server";

import { getRequestContext } from "@cloudflare/next-on-pages";

type postjson = {
  url: string;
  preferedCode?: string;
  expirationTtl?: number;
};

export async function GetUrl(code: string) {
  const urlkv = getRequestContext().env.urlservice;
  if (!code) {
    throw "No code provided";
  }

  if (code === "list") {
    const list = await urlkv.list();
    console.log(list);
    return JSON.stringify(list);
  }

  const url = await urlkv.get(code);
  if (!url) {
    throw "URL not found";
  }
  return url;
}

export async function CreateUrl(json: postjson) {
  const defaultTTL: number = 60 * 60 * 24 * 7;

  let newUrl: string = "";
  let code: string = "";
  let expirationTtl: number = defaultTTL;

  const urlkv = getRequestContext().env.urlservice;
  if (!json) {
    throw "missing json";
  }
  console.log({ body: json });
  const url = json.url;
  const preferedCode = json.preferedCode;
  const ttl = json.expirationTtl;

  if (!url) {
    throw "Missing url";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    console.log({ url: url });
    newUrl = url;
  } else {
    newUrl = "https://" + url;
  }

  if (preferedCode) {
    if (preferedCode === "list") {
      throw "Cannot use 'list' as a code";
    } else if (preferedCode.length > 32) {
      throw "Code too long";
    }
    const test = await urlkv.get(preferedCode);
    if (test) {
      console.log("ERR:code already exists");
      throw "code already exists";
    }
    code = preferedCode;
  } else {
    const uuid = crypto.randomUUID();
    console.log(uuid.replaceAll("-", ""));
    code = uuid.replaceAll("-", "");
  }
  if (ttl) {
    expirationTtl = ttl;
  }
  console.log({
    key: code,
    value: newUrl,
    expirationTtl: expirationTtl,
  });
  try {
    await urlkv.put(code, newUrl, {
      expirationTtl: expirationTtl,
      metadata: { url: newUrl },
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
  return code;
}

export async function DeleteUrl(code: string) {
  const urlkv = getRequestContext().env.urlservice;
  if (!code) {
    throw "No code provided";
  }
  try {
    await urlkv.delete(code);
  } catch (e) {
    console.log(e);
    throw e;
  }
  return code;
}
