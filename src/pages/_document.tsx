import { Html, Head, Main, NextScript } from 'next/document'
import { createGetInitialProps } from '@mantine/next';

Document.getInitialProps = createGetInitialProps();

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
