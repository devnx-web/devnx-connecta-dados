import React from "react";

import { sanitizeRichHtml } from "core/utils/sanitizeHtml";

interface TextWithHTMLProps {
  text?: string;
  className?: string;
}

export const TextWithHTML: React.FC<TextWithHTMLProps> = ({ text, className }) => {
  if (!text) {
    return null;
  }

  const sanitizedHtmlText = sanitizeRichHtml(text);

  // The HTML is sanitized above before being passed to React.
  // eslint-disable-next-line react/no-danger
  return <span className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtmlText }} />;
};
