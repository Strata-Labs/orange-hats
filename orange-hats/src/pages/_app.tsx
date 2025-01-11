import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Provider as JotaiProvider } from "jotai";
import { trpc } from "../../utils/trpc";
import Footer from "@/components/Footer/Footer";

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <div className="min-h-screen flex flex-col">
            <div className="flex-grow">
              <Component {...pageProps} />
            </div>
            <Footer />
          </div>
        </JotaiProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default MyApp;
