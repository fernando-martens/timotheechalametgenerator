import { createSignal, onMount, Show, type Component } from 'solid-js';
import namesData from "./names.json";
import avatarImg from "./assets/avatar.jpeg";
import { Step } from './interface';
import FingerprintJS from "@fingerprintjs/fingerprintjs";

function shuffle(arr: string[]): [string, string[]] {
  const index = Math.floor(Math.random() * arr.length);
  return [arr[index], arr.filter((_, i) => i !== index)];
}

const App: Component = () => {
  const [first, initialRemaining] = shuffle([...namesData.names]);
  const [remaining, setRemaining] = createSignal(initialRemaining);
  const [name, setName] = createSignal(first);
  const [step, setStep] = createSignal<Step>("idle");
  const [suggestion, setSuggestion] = createSignal("");
  const [token, setToken] = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);
  const [toast, setToast] = createSignal<{ message: string; type: "success" | "error" } | null>(null);

  let widgetRef: HTMLDivElement | undefined;

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  function startSuggest() {
    setStep("validating");
    // @ts-ignore
    window.turnstile.render(widgetRef, {
      sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
      callback: (t: string) => {
        setToken(t);
        setStep("form");
        // @ts-ignore
        window.turnstile.remove();
      },
      "expired-callback": () => {
        setToken("");
        setStep("idle");
      }
    });
  }

  async function handleSubmit() {
    if (!token() || !suggestion().trim()) return;

    setSubmitting(true);
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();

      const res = await fetch(import.meta.env.VITE_API_URL + "/suggest", {
        headers: { 
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({
          suggestion: suggestion(),
          turnstileToken: token(),
          fingerprint: result.visitorId,
        }),
      });

      console.log({ res });
      if (res.ok) {
        setStep("idle");
        setSuggestion("");
        showToast("Thank you for your suggestion! ♥", "success");
      } else {
        showToast("Something went wrong, try again.", "error");
      }
    } catch {
      showToast("Something went wrong, try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setStep("idle");
  }

  function handleGenerate() {
    let pool = remaining();
    if (pool.length === 0) {
      const [picked, rest] = shuffle([...namesData.names]);
      setName(picked);
      setRemaining(rest);
      return;
    }
    const [picked, rest] = shuffle(pool);
    setName(picked);
    setRemaining(rest);
  }

  return (
    <main class="relative min-h-[100dvh] bg-white flex flex-col items-center justify-center px-4 py-16">

      {/* Toast */}
      <Show when={toast()}>
        <div
          class={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg text-sm font-medium shadow-md transition-all duration-300 ${
            toast()!.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast()!.message}
        </div>
      </Show>

      <div class="w-40 h-40 rounded-full overflow-hidden mb-10 shadow-sm">
        <img src={avatarImg} alt="Timothée Chalamet image" class="w-full h-full object-cover" />
      </div>

      <h1 class="font-serif text-3xl md:text-4xl text-center text-gray-800 text-center mb-10 tracking-tight">
        Timothée Chalamet name generator
      </h1>

      <Show when={step() === "idle"}>
        <div class="h-14 flex items-center justify-center mb-10">
          <p class="font-serif text-2xl text-center md:text-3xl text-gray-500 animate-fade-slide">
            {name()}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          class="cursor-pointer px-8 py-2.5 border border-gray-300 rounded text-base font-medium bg-white hover:bg-gray-50 active:scale-95 transition-all duration-150"
          style="touch-action: manipulation;"
        >
          Generate name
        </button>
        <button
          onClick={startSuggest}
          class="mt-4 text-sm text-center text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
          style="touch-action: manipulation; cursor: pointer;"
        >
          Suggest a name
        </button>
      </Show>

      <Show when={step() === "form"}>
        <div class="flex flex-col items-center gap-4 w-full max-w-md px-4">
          <input
            type="text"
            placeholder="Your name suggestion..."
            value={suggestion()}
            onInput={(e) => setSuggestion(e.currentTarget.value)}
            class="border border-gray-300 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
            style="font-size: 16px;"
            autofocus
          />
          <div class="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={handleCancel}
              disabled={submitting()}
              class="w-full px-2 py-2 rounded-lg text-base font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-40 transition-all duration-150"
              style="touch-action: manipulation; cursor: pointer;"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting() || !suggestion().trim()}
              class="w-full px-2 py-2 rounded-lg text-base font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-40 transition-all duration-150"
              style="touch-action: manipulation; cursor: pointer;"
            >
              <Show when={submitting()} fallback="Submit">
                <span class="animate-pulse">Sending...</span>
              </Show>
            </button>
          </div>
        </div>
      </Show>

      <div class="absolute bottom-4 flex flex-col items-center gap-1">
        <p class="text-sm text-gray-400">Made by Fer and Nina with ♥</p>
      </div>

      <div class="mt-4" ref={widgetRef} />
    </main>
  );
};

export default App;