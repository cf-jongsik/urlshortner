"use client";

export const runtime = "edge";

import { useState } from "react";
import Link from "next/link";

// react-hook-form
import { useForm } from "react-hook-form";
// mui components
import { TextField, Typography, IconButton } from "@mui/material";
// mui icons
import {
  TravelExplore,
  LinkOutlined,
  AccessAlarmOutlined,
  LocalOfferOutlined,
  LaunchOutlined,
  Error,
  ViewListOutlined,
} from "@mui/icons-material";

// actions
import { CreateUrl } from "@/app/actions/kv";

// schema validatipon
import { ZodError, z } from "zod";

export default function Home() {
  const { register, handleSubmit, getValues } = useForm();

  type submit = {
    code?: string;
    ttl?: number;
    url?: string;
    newurl?: string;
  };
  type error = {
    type?: string;
    msg?: string;
    status: boolean;
  };

  const [submit, setSubmit] = useState<submit>({});
  const [error, setError] = useState<error>({ status: false });

  const onSubmit = async () => {
    const originalUrl: string = getValues("url");
    const expirationTtl: number = parseInt(getValues("ttl"));
    const preferedCode: string = getValues("code");
    setError({ status: false });

    const regex = new RegExp(":");

    const schema = z.object({
      url: z.union([
        z
          .string()
          .includes(":")
          .startsWith("http://", { message: "Err: Invalid Protocol" })
          .url({ message: "Err:Invalid URL" })
          .includes("."),
        z
          .string()
          .includes(":")
          .startsWith("https://", { message: "Err:Invalid Protocol" })
          .url({ message: "Err:Invalid URL" })
          .includes("."),
        z
          .string()
          .includes(".")
          .refine((val) => val.includes(":") === false),
      ]),
      ttl: z.union([
        z
          .number()
          .nonnegative({ message: "TTL negative, must be >=60" })
          .gte(60, { message: "TTL too low, must be >=60" })
          .lte(3600 * 24 * 365, {
            message: "TTL too high, must be lower than 1 year",
          }),
        z.number().refine((val) => val === 0),
      ]),
      code: z
        .string()
        .max(32, { message: "Code too long, maximum 32 characters" }),
    });

    try {
      schema.parse({
        url: originalUrl,
        ttl: expirationTtl,
        code: preferedCode,
      });
      const res = await CreateUrl({
        url: originalUrl,
        expirationTtl: expirationTtl,
        preferedCode: preferedCode,
      });
      setSubmit({
        code: res,
        newurl: window.location.origin + "/" + res,
        ttl: getValues("ttl"),
        url: getValues("url"),
      });
    } catch (e: any) {
      if (e instanceof ZodError) {
        setError({
          type: e.issues[0].path.toString(),
          msg: e.issues[0].message,
          status: true,
        });
        setSubmit({});
      } else if (typeof e === typeof Error) {
        setError({
          type: "api",
          msg: e.message,
          status: true,
        });
        setSubmit({});
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-white dark:bg-slate-500 flex justify-center items-top">
      <div className="w-11/12 h-3/4 p-10 m-10 justify-center items-center bg-white dark:bg-slate-300">
        <form className="mb-5" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register("url")}
            className="p-3 w-full"
            error={error.status && error.type === "url"}
            required
            id="url"
            type={"text"}
            label="URL"
            InputProps={{
              startAdornment: (
                <LinkOutlined fontSize="large" className="mr-3" />
              ),
              endAdornment: (
                <IconButton type="submit">
                  <TravelExplore fontSize="large" />
                </IconButton>
              ),
            }}
            helperText="with http(s):// or without example: cloudflare.com or https://cloudflare.com"
          />
          <TextField
            {...register("ttl")}
            label="Time To Live (expire)"
            error={error.status && error.type === "ttl"}
            type={"number"}
            id="ttl"
            size="small"
            className="m-3"
            defaultValue={3600}
            InputProps={{
              startAdornment: (
                <AccessAlarmOutlined fontSize="medium" className="mr-3" />
              ),
            }}
            helperText="(0=forever)"
          />
          <TextField
            {...register("code")}
            error={error.status && error.type === "code"}
            id="code"
            type={"text"}
            label="Prefered Path"
            size="small"
            className="m-3"
            InputProps={{
              startAdornment: <LocalOfferOutlined className="mr-3" />,
            }}
            helperText="(blank:random)"
          />
        </form>
        <div className="pl-1 text-pretty">
          <Typography variant="h6" gutterBottom>
            <LinkOutlined fontSize="large" className="mr-3" />
            <a href={submit.newurl}>Short URL: {submit.newurl}</a>
            <br />
            <AccessAlarmOutlined fontSize="large" className="mr-3" />
            Time to Live: {submit.ttl == 0 ? "forever" : submit.ttl}
            <br />
            <LaunchOutlined fontSize="large" className="mr-3" />
            redirect URL: {submit.url}
            <br />
          </Typography>
        </div>
        <div className="pt-10">
          <Typography
            {...register("error")}
            variant="h5"
            id="error"
            color="red"
            gutterBottom
            visibility={error.status ? "visible" : "hidden"}
          >
            <Error fontSize="large" className="mr-3" />
            {error.msg}
            <br />
          </Typography>
        </div>
        <div>
          <Link href="/admin">
            <IconButton className="mt-5 align-bottom">
              <ViewListOutlined fontSize="large" />
              List All
            </IconButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
