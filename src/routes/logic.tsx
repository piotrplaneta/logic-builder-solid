import { A } from "solid-start";
import Counter from "~/components/Counter";
import LogicStatementBuilder from "~/components/LogicStatementBuilder";

export default function Logic() {
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
        Logic showcase
      </h1>
      <LogicStatementBuilder />
    </main>
  );
}
