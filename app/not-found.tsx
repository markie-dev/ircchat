import { Metadata } from "next";

export const metadata: Metadata = {
    title: "404 - ircchat",
  };

export default function NotFound() {
  const emoticons = [
    '(^_^)b',
    '(o_o)/',
    '(T_T)',
    '(>_<)',
    '(=_=)',
    '(;_;)',
    '(^_^)',
    '(o_O)',
    '(>.<)',
    '(^_^)b',
    '(o_o)',
    '(T_T)',
    '(>_<)',
    '(^o^)',
    '(=_=)',
    '(;_;)',
    '(^_^)',
    '(o_O)',
    '(>.<)'
  ];

  const randomEmote = emoticons[Math.floor(Math.random() * emoticons.length)];

  return (
    <div className="grid place-items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-[4rem] mb-2">
          {randomEmote}
        </h1>
        <p className="text-sm">
        unfortunately, this page does not exist
        </p>
      </div>
    </div>
  )
}