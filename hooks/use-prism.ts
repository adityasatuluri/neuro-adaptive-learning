"use client"

import { useEffect } from "react"
import Prism from "prismjs"
import "prismjs/components/prism-python"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-java"
import "prismjs/components/prism-cpp"

export function usePrism() {
  useEffect(() => {
    Prism.highlightAll()
  }, [])

  return Prism
}
