import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Layout from "@/components/layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EduCraft - Training Center Management",
  description: "Modern training center management platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
