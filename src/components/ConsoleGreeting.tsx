"use client";

import { useEffect } from "react";
import { BASE_PATH, CAREERS_URL, REPO_URL } from "@/game/constants";

/**
 * Console greeting easter egg. Renders null; logs a styled banner to devtools
 * once per page load (module-level guard survives fast refresh remounts).
 */

let hasLogged = false;

export default function ConsoleGreeting() {
  useEffect(() => {
    if (hasLogged) return;
    hasLogged = true;

    console.log(
      "%c▲ cursteroids" +
        "%c\n\nYou opened the console. Correct instinct.\n" +
        "Credibility comes from what you ship alongside the team,\nnot from what you present to them.\n",
      "font-family: monospace; font-size: 16px; font-weight: bold; color: #2dd4bf;",
      "font-family: monospace; color: inherit;",
    );
    console.log(
      "%cCurious?      %cGET " +
        BASE_PATH +
        "/api/standup\n" +
        "%cSerious?      %c" +
        CAREERS_URL +
        "\n" +
        "%cThe take-home %c" +
        REPO_URL,
      "font-family: monospace; color: #0f766e; font-weight: bold;",
      "font-family: monospace; color: inherit;",
      "font-family: monospace; color: #0f766e; font-weight: bold;",
      "font-family: monospace; color: inherit;",
      "font-family: monospace; color: #0f766e; font-weight: bold;",
      "font-family: monospace; color: inherit;",
    );
  }, []);

  return null;
}
