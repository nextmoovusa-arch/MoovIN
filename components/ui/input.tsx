import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  ),
);
Label.displayName = "Label";

/**
 * Champ numérique sans le « 0 » collant au départ.
 * - Affiche une chaîne vide quand la valeur est 0/indéfinie (sauf si l'utilisateur tape).
 * - Renvoie un nombre (ou undefined si vide) via onValueChange.
 */
export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onValueChange, onBlur, ...props }, ref) => {
    // État local en chaîne pour permettre la saisie libre (vide, décimales en cours…)
    const [text, setText] = React.useState<string>(
      value === undefined || value === 0 ? "" : String(value),
    );

    // Synchronise si la valeur change depuis l'extérieur (reset…) sans casser la frappe
    React.useEffect(() => {
      const current = text === "" ? undefined : Number(text.replace(",", "."));
      if (value !== current) {
        setText(value === undefined || value === 0 ? "" : String(value));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value;
      // Autorise vide, chiffres, un séparateur décimal et un signe -
      if (raw === "" || /^-?\d*([.,]\d*)?$/.test(raw)) {
        setText(raw);
        if (raw === "" || raw === "-" || raw === "." || raw === ",") {
          onValueChange(undefined);
        } else {
          onValueChange(Number(raw.replace(",", ".")));
        }
      }
    }

    return (
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={text}
        onChange={handleChange}
        onBlur={(e) => {
          // Nettoie un éventuel séparateur final
          if (text.endsWith(".") || text.endsWith(",")) setText(text.slice(0, -1));
          onBlur?.(e);
        }}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";

export { Input, Textarea, Label, NumberInput };
