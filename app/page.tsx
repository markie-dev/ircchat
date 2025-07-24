import { redirect } from 'next/navigation'

export default function Home() {
  // redirect to general chat until we have a home page
  redirect('/general')
}
