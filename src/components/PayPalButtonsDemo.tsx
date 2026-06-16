import {
  PayPalProvider,
  PayPalSavePaymentButton,
  PayPalCreditSavePaymentButton,
  type OnApproveDataSavePayments,
  type OnCancelDataSavePayments,
  type OnErrorData,
  type OnCompleteData,
} from "@paypal/react-paypal-js/sdk-v6";
import { useEffect } from "react";

const clientId =
  "AST9QrM5r_rDKWyF_DBR8RO3_8RVhotKNnOn5ycEnLdPq5DofmGDfpP6V-QxtO1RrvK4GNlehsJ4aHJB";

function PayPalSaveButtons() {
  useEffect(() => {
    const forceShow = () => {
      const host = document.querySelector(
        "paypal-credit-button",
      ) as HTMLElement | null;

      if (!host) return;

      host.style.setProperty("display", "block", "important");
      host.style.setProperty("visibility", "visible", "important");
      host.style.setProperty("opacity", "1", "important");
      host.style.setProperty("width", "100%", "important");

      const shadow = host.shadowRoot;
      if (!shadow) return;

      shadow.querySelectorAll("style").forEach((style) => {
        if (style.textContent?.includes("display:none")) {
          style.remove();
        }
      });

      // const button = shadow.querySelector("button") as HTMLElement | null;

      // if (button) {
      //   button.style.setProperty("display", "block", "important");
      //   button.style.setProperty("visibility", "visible", "important");
      //   button.style.setProperty("opacity", "1", "important");
      //   button.style.setProperty("width", "100%", "important");
      //   button.style.setProperty("min-height", "45px", "important");
      // }
    };

    forceShow();

    const observer = new MutationObserver(forceShow);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const interval = window.setInterval(forceShow, 300);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);
  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Save PayPal</h2>

        <PayPalSavePaymentButton
          createVaultToken={async () => {
            const response = await fetch("/api/create-vault-token", {
              method: "POST",
            });
            const { vaultSetupToken } = await response.json();
            return { vaultSetupToken };
          }}
          onApprove={async (data: OnApproveDataSavePayments) => {
            console.log("PayPal saved:", data);
          }}
          onCancel={(data: OnCancelDataSavePayments) => {
            console.log("PayPal save cancelled:", data);
          }}
          onError={(data: OnErrorData) => {
            console.error("PayPal save error:", data);
          }}
          onComplete={(data: OnCompleteData) => {
            console.log("PayPal save flow completed:", data);
          }}
        />
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Save PayPal Credit</h2>
        <PayPalCreditSavePaymentButton
          createVaultToken={async () => {
            const response = await fetch("/api/create-vault-token", {
              method: "POST",
            });

            const { vaultSetupToken } = await response.json();
            return { vaultSetupToken };
          }}
          onApprove={async (data) => {
            console.log("Credit saved:", data);
          }}
          onCancel={async (data) => {
            console.log("Credit save cancelled", data);
          }}
          onError={async (data) => {
            console.error("Credit save error:", data);
          }}
          onComplete={async (data) => {
            console.log("Credit save flow completed", data);
          }}
        />
      </div>
    </div>
  );
}

export default function PayPalButtonsDemo() {
  return (
    <PayPalProvider
      clientId={clientId}
      environment="sandbox"
      components={["paypal-payments"]}
      pageType="checkout"
    >
      <PayPalSaveButtons />
    </PayPalProvider>
  );
}
