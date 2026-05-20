import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

function isLoadingToast(title: unknown) {
  return typeof title === "string" && /^Opening\b/i.test(title);
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={2000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const showDescription = props.variant === "destructive" && description;
        const showLoadingRing = props.variant !== "destructive" && isLoadingToast(title);

        return (
          <Toast key={id} {...props}>
            <div
              className={
                showDescription
                  ? "grid gap-1 text-center"
                  : "flex items-center justify-center gap-2 text-center"
              }
            >
              {title && <ToastTitle>{title}</ToastTitle>}
              {showLoadingRing && (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 rounded-full border border-white/30 border-t-white animate-spin"
                />
              )}
              {showDescription && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
