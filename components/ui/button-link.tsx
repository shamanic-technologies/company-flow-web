import * as React from "react"
import Link from "next/link"
import { Button } from "./button"
import { cn } from "@/lib/utils"

/**
 * ButtonLink Component
 * Combines the styling of Button with link functionality
 */
interface ButtonLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href: string
  external?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  color?: "primary" | "github" | "api" | "webhook" | "agent" | "secondary"
  children: React.ReactNode
}

export function ButtonLink({
  href,
  external = false,
  variant = "default",
  color,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  // Custom color styles with gradients and specific colors
  const colorStyles = {
    primary: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white",
    github: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white",
    api: "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white",
    webhook: "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white",
    agent: "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white",
    secondary: "text-blue-400 border-blue-500/50 hover:bg-blue-500/10" // This requires variant="outline" for border to appear
  }

  const colorClass = color ? colorStyles[color] : "";

  // For external links, use a regular anchor tag
  if (external) {
    return (
      <Button
        className={cn(colorClass, className)}
        asChild
        variant={color === "secondary" ? "outline" : variant}
        {...props}
      >
        <a 
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      </Button>
    )
  }

  // For internal links, use Next.js Link
  return (
    <Button
      className={cn(colorClass, className)}
      asChild
      variant={color === "secondary" ? "outline" : variant}
      {...props}
    >
      <Link href={href}>
        {children}
      </Link>
    </Button>
  )
} 