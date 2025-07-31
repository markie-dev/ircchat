import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "username - ircchat",
};

export default function UsernameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}