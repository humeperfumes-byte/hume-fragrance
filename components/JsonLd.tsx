import Script from "next/script";

function getJsonLdId(json: string) {
  let hash = 0;
  for (let index = 0; index < json.length; index += 1) {
    hash = (hash * 31 + json.charCodeAt(index)) | 0;
  }
  return `json-ld-${Math.abs(hash).toString(36)}`;
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <Script
      id={getJsonLdId(json)}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: json,
      }}
    />
  );
}
