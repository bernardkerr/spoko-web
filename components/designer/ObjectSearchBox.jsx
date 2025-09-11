"use client";

import React from "react";
import { TextField } from "@radix-ui/themes";

export default function ObjectSearchBox({ value, onChange, placeholder = "Search objects..." }) {
  return (
    <TextField.Root size="2" variant="soft" radius="large" placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} />
  );
}
