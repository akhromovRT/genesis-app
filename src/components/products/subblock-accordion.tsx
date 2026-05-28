import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { BlockSubblock } from "@/lib/products/blocks";

interface SubblockAccordionProps {
  subblocks: BlockSubblock[];
}

export function SubblockAccordion({ subblocks }: SubblockAccordionProps) {
  if (subblocks.length === 0) return null;

  return (
    <Accordion className="w-full">
      {subblocks.map((sb, idx) => (
        <AccordionItem key={idx} value={`item-${idx}`}>
          <AccordionTrigger className="text-left">
            <span className="font-medium">{sb.title}</span>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {sb.pains.map((p, i) => (
                <li key={i} className="before:mr-2 before:content-['—']">
                  {p}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
