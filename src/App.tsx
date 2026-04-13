import { createSignal, type Component } from 'solid-js';
import namesData from "./names.json";
import avatarImg from "./assets/avatar.jpg";

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(): string {
  return `${pickRandom(namesData.firstNames)} ${pickRandom(namesData.lastNames)}`;
}

const App: Component = () => {
  const [name, setName] = createSignal(generateName());

  function handleGenerate() {
    setName(generateName());
  }

  return (
    <main class="relative min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16">
      <div class="w-40 h-40 rounded-full overflow-hidden mb-10 shadow-sm">
        <img src={avatarImg} alt="Timothée Chalamet image" class="w-full h-full object-cover" />
      </div>

      <h1 class="font-serif text-3xl md:text-4xl text-gray-800 text-center mb-10 tracking-tight">
        Timothée Chalamet name generator
      </h1>

      <div class="h-14 flex items-center justify-center mb-10">
        <p
          class="font-serif text-2xl md:text-3xl text-gray-500 animate-fade-slide"
        >
          {name()}
        </p>
      </div>

      <button
        onClick={handleGenerate}
        class="px-8 py-3 border border-gray-300 rounded text-gray-700 text-base font-medium bg-white hover:bg-gray-50 active:scale-95 transition-all duration-150 cursor-pointer"
      >
        Generate name
      </button>

      <div class="absolute bottom-4 flex flex-col items-center gap-1">
        <p class="text-sm text-gray-400">
          Made by Fer and Nina with love ♥
        </p>
        <a
          href="https://github.com/fernando-martens/timotheechalametgenerator"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
        >
          Want to contribute? Open a PR on GitHub ↗
        </a>
      </div>
    </main>
  );
};

export default App;
