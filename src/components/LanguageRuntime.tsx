import { useEffect } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { translateText } from "../i18n/translations";

const originalText = new WeakMap<Text, string>();

export function LanguageRuntime() {
  const language = useSettingsStore((state) => state.settings.language);

  useEffect(() => {
    translateDocument(language);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => translateNode(node, language));
        if (mutation.type === "characterData") {
          translateNode(mutation.target, language);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language]);

  return null;
}

function translateDocument(language: "en" | "mr" | "hi") {
  translateNode(document.body, language);
}

function translateNode(node: Node, language: "en" | "mr" | "hi") {
  if (node.nodeType === Node.TEXT_NODE) {
    translateTextNode(node as Text, language);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const element = node as Element;
  if (shouldSkip(element)) {
    return;
  }

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();

  while (current) {
    translateTextNode(current as Text, language);
    current = walker.nextNode();
  }
}

function translateTextNode(node: Text, language: "en" | "mr" | "hi") {
  const parent = node.parentElement;
  if (!parent || shouldSkip(parent)) {
    return;
  }

  const value = node.data;
  if (!value.trim()) {
    return;
  }

  const original = originalText.get(node) ?? value;
  originalText.set(node, original);

  const match = original.match(/^(\s*)(.*?)(\s*)$/s);
  if (!match) {
    return;
  }

  const [, leading, text, trailing] = match;
  const translated = translateText(text, language);
  const next = `${leading}${translated}${trailing}`;

  if (node.data !== next) {
    node.data = next;
  }
}

function shouldSkip(element: Element) {
  return Boolean(
    element.closest(
      "script, style, textarea, input, code, pre, [data-no-translate], [contenteditable='true']",
    ),
  );
}
