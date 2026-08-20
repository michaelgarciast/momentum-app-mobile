import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <ScrollViewStyleReset />

        <meta
          name="description"
          content="Momentum es tu app para construir hábitos positivos, un día a la vez."
        />
        <meta name="theme-color" content="#4f46e5" />
        <style>{`html, body { background-color: #f9fafb; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
