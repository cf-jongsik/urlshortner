"use client";

import { useState } from "react";
import Link from "next/link";

// react-hook-form
import { useForm } from "react-hook-form";
// mui components
import { Button } from "@mui/material";
// mui icons
import { FormatListBulleted, Delete, Undo } from "@mui/icons-material";

// actions
import { GetUrl, DeleteUrl } from "@/app/actions/kv";

type meta = {
  url: string;
};

export default function Page() {
  const { handleSubmit } = useForm();

  const [list, setList] = useState<any>();
  let deleted: string[] = [];

  const drawTable = (json: KVNamespaceListResult<meta, string>) => {
    const delColor = "bg-slate-600 line-through";
    const regColor = "bg-slate-400";
    let color = "";

    const result = json.keys.map((key) => {
      const ttl = new Date((key.expiration as number) * 1000);
      if (deleted.includes(key.name)) {
        color = delColor;
      } else {
        color = regColor;
      }
      return (
        <tr key={key.name}>
          <td className={color + " px-2 w-1/2"}>
            <a
              className="relative"
              href={window.location.origin + "/" + key.name}
            >
              <div className="opacity-100 hover:opacity-0 transition-all w-full">
                {key.name}
              </div>
              <div className="hover:bg-white top-0 absolute opacity-0 hover:opacity-100 transition-all w-full">
                {window.location.origin + "/" + key.name}
              </div>
            </a>
          </td>
          <td className={color + " px-3"}>{ttl.toLocaleDateString()}</td>
          <td className={color + " px-3"}>
            <a className="relative" href={key.metadata?.url}>
              <div className="hover:bg-white transtiion-all transition-all">
                {key.metadata?.url}
              </div>
            </a>
          </td>
          <td className={color + " px-3 hover:bg-white"}>
            <Button
              onClick={async () => {
                await DeleteUrl(key.name);
                deleted.push(key.name);
                drawTable(json);
              }}
            >
              <Delete fontSize="medium" />
            </Button>
          </td>
        </tr>
      );
    });
    setList(result);
  };

  const onSubmit = async () => {
    const res = await GetUrl("list");
    const json: KVNamespaceListResult<meta, string> = JSON.parse(res);
    drawTable(json);
  };

  return (
    <div className="h-screen w-screen bg-white flex dark:bg-slate-350 justify-center items-top">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-screen p-5"
        id="form"
      >
        <Link href="/">
          <Button size="large" className="pl-2">
            <Undo />
            back
          </Button>
        </Link>
        <Button size="large" type="submit" className="pl-10 pb-5" id="button">
          <FormatListBulleted fontSize="large" />
          List all Keys
        </Button>
        <div>
          <table className="table-auto border border-separate border-spacing-1px border-slate-500 w-2/3">
            <thead>
              <tr>
                <th className="bg-slate-300 px-3">Short URL Code</th>
                <th className="bg-slate-300 px-3">Expire Date</th>
                <th className="bg-slate-300 px-20">URL</th>
                <th className="bg-slate-300"></th>
              </tr>
            </thead>
            <tbody>{list}</tbody>
          </table>
        </div>
      </form>
    </div>
  );
}
