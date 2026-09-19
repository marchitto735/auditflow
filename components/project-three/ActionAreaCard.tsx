"use client";

import Link from "next/link";

type ActionAreaCardProps = {
  thumbnail: string;
  name?: string;
  descriptions?: string;
  thumbHeight?: string;
  route?: string;
};

export default function ActionAreaCard({
  thumbnail,
  name,
  descriptions,
  thumbHeight,
  route,
}: ActionAreaCardProps) {
  const height = thumbHeight ? `${thumbHeight}px` : undefined;
  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnail}
        alt={name ?? "Project"}
        className="rounded-2xl"
        style={{
          width: "100%",
          height: height ?? "auto",
          objectFit: "cover",
          display: "block",
        }}
      />
      {name ? <p>{name}</p> : null}
      {descriptions ? <p>{descriptions}</p> : null}
    </>
  );

  if (route) {
    return (
      <Link href={route} className="no-underline text-inherit">
        {body}
      </Link>
    );
  }

  return <div>{body}</div>;
}
