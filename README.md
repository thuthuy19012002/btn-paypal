# Hướng dẫn tạo nút Save PayPal và PayPal Credit

Demo: https://btn-paypal.vercel.app/

## Mục tiêu

File này hướng dẫn cách tích hợp thử 2 nút:

- `PayPalSavePaymentButton`
- `PayPalCreditSavePaymentButton`

Mục đích là hiển thị cả 2 button trên giao diện để test flow lưu phương thức thanh toán PayPal trong môi trường sandbox.

> Lưu ý: PayPal Credit có thể bị PayPal ẩn nếu tài khoản, quốc gia hoặc buyer không đủ điều kiện. Phần `useEffect` bên dưới chỉ dùng để ép hiển thị button phục vụ debug giao diện.

---

## 1. Cài package

```bash
npm install @paypal/react-paypal-js
```

Hoặc:

```bash
yarn add @paypal/react-paypal-js
```

---

## 2. Tạo component PayPal Buttons Demo

Tạo file ví dụ:

```tsx
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

      // Nếu muốn ép button bên trong shadow DOM hiện rõ hơn,
      // có thể mở comment đoạn dưới.
      //
      // const button = shadow.querySelector("button") as HTMLElement | null;
      //
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
```

---

## 3. Giải thích các phần chính

### `PayPalProvider`

```tsx
<PayPalProvider
  clientId={clientId}
  environment="sandbox"
  components={["paypal-payments"]}
  pageType="checkout"
>
```

`PayPalProvider` dùng để load PayPal SDK.

Các props chính:

- `clientId`: sandbox client ID.
- `environment="sandbox"`: chạy môi trường test.
- `components={["paypal-payments"]}`: load component thanh toán PayPal.
- `pageType="checkout"`: khai báo page đang là checkout page.

---

### `PayPalSavePaymentButton`

```tsx
<PayPalSavePaymentButton />
```

Button này dùng để lưu PayPal payment method.

Nó cần hàm:

```tsx
createVaultToken={async () => {
  const response = await fetch("/api/create-vault-token", {
    method: "POST",
  });

  const { vaultSetupToken } = await response.json();

  return { vaultSetupToken };
}}
```

Flow hoạt động:

1. Người dùng click button.
2. Component gọi API `/api/create-vault-token`.
3. Backend tạo `vaultSetupToken`.
4. Frontend trả `{ vaultSetupToken }` cho PayPal SDK.
5. PayPal mở flow lưu payment method.

---

### `PayPalCreditSavePaymentButton`

```tsx
<PayPalCreditSavePaymentButton />
```

Button này dùng để lưu PayPal Credit.

Tuy nhiên, trong quá trình test có thể PayPal render ra button nhưng tự thêm CSS ẩn bên trong shadow DOM:

```html
<paypal-credit-button>
  #shadow-root
  <style>
    button {
      display: none !important;
    }
  </style>
  <button aria-label="PayPal Credit"></button>
</paypal-credit-button>
```

Vì vậy button có tồn tại trong DOM nhưng không hiển thị trên giao diện.

---

## 4. Vì sao cần `useEffect`

Đoạn `useEffect` dùng để ép button PayPal Credit hiện ra khi test giao diện.

```tsx
const host = document.querySelector(
  "paypal-credit-button",
) as HTMLElement | null;
```

`host` là custom element bên ngoài:

```html
<paypal-credit-button></paypal-credit-button>
```

Sau đó ép host hiện:

```tsx
host.style.setProperty("display", "block", "important");
host.style.setProperty("visibility", "visible", "important");
host.style.setProperty("opacity", "1", "important");
host.style.setProperty("width", "100%", "important");
```

Tiếp theo truy cập shadow DOM:

```tsx
const shadow = host.shadowRoot;
```

Rồi xoá các thẻ `<style>` có chứa `display:none`:

```tsx
shadow.querySelectorAll("style").forEach((style) => {
  if (style.textContent?.includes("display:none")) {
    style.remove();
  }
});
```

Mục đích là xoá CSS do PayPal inject vào để ẩn button.

---

## 5. Vì sao cần `MutationObserver`

PayPal có thể render button hoặc inject style sau khi React component đã mount.

Vì vậy cần theo dõi DOM:

```tsx
const observer = new MutationObserver(forceShow);

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
```

Mỗi khi DOM thay đổi, `forceShow()` sẽ chạy lại để tiếp tục xoá style ẩn button.

---

## 6. Vì sao có `setInterval`

```tsx
const interval = window.setInterval(forceShow, 300);
```

Cứ mỗi 300ms code sẽ chạy lại `forceShow()`.

Việc này giúp debug chắc hơn trong trường hợp PayPal inject lại CSS nhiều lần.

Khi component unmount thì cần cleanup:

```tsx
return () => {
  observer.disconnect();
  window.clearInterval(interval);
};
```

---

## 7. Các callback của button

### `onApprove`

```tsx
onApprove={async (data) => {
  console.log("PayPal saved:", data);
}}
```

Chạy khi user approve thành công.

### `onCancel`

```tsx
onCancel={(data) => {
  console.log("PayPal save cancelled:", data);
}}
```

Chạy khi user huỷ flow.

### `onError`

```tsx
onError={(data) => {
  console.error("PayPal save error:", data);
}}
```

Chạy khi có lỗi.

### `onComplete`

```tsx
onComplete={(data) => {
  console.log("PayPal save flow completed:", data);
}}
```

Chạy khi flow kết thúc.

---

## 8. Lưu ý quan trọng

Cách ép hiển thị PayPal Credit button bằng `useEffect` chỉ nên dùng để debug UI.

Trong production, không nên ép hiển thị nếu PayPal Credit không eligible, vì:

- Button có thể hiện nhưng click không chạy đúng.
- PayPal Credit phụ thuộc country, account, buyer eligibility.
- PayPal có thể chủ động ẩn button theo rule của họ.

Nếu muốn đúng chuẩn hơn, nên kiểm tra eligibility trước khi render PayPal Credit button.

---

## 9. Link demo

Demo hiện tại:

https://btn-paypal.vercel.app/
