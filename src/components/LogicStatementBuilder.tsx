import { For, Match, Switch, createSignal } from "solid-js";
import { SetStoreFunction, createStore, produce } from "solid-js/store";

type PathPart = "operandA" | "operandB";
let operationId = 0;

type Variable = {
  id: number;
  name: string;
  value: boolean;
};

type VariableOp = {
  id: number;
  value: number;
  type: "variable";
  path: PathPart[];
  operandA: Noop;
  operandB: Noop;
};

const VariableOpView = ({
  variableOp,
  setOperationTree,
  variables,
}: {
  variableOp: VariableOp;
  setOperationTree: SetStoreFunction<Operation>;
  variables: Variable[];
}) => {
  return (
    <select
      class="border-2 border-gray-400 p-1 my-2"
      value={variables.find((v) => v.id == variableOp.value)?.id}
      onchange={(e) => {
        setOperationTree(
          ...pathToStorePath(variableOp.path),
          "value",
          Number(e.currentTarget.value)
        );
      }}
    >
      <For each={variables}>
        {(variable) => <option value={variable.id}>{variable.name}</option>}
      </For>
    </select>
  );
};

type Noop = {
  id: number;
  type: "noop";
  value: undefined;
  path: PathPart[];
  operandA: Noop;
  operandB: Noop;
};

const NoopView = ({
  noop,
  setOperationTree,
}: {
  noop: Noop;
  setOperationTree: SetStoreFunction<Operation>;
}) => {
  return <div>undefined</div>;
};

type Constant = {
  id: number;
  value: boolean;
  type: "constant";
  path: PathPart[];
  operandA: Noop;
  operandB: Noop;
};

const pathToStorePath = (path: PathPart[]) => {
  return path.slice(0, 6) as [
    PathPart,
    PathPart,
    PathPart,
    PathPart,
    PathPart,
    PathPart
  ];
};

const ConstantView = ({
  constant,
  setOperationTree,
}: {
  constant: Constant;
  setOperationTree: SetStoreFunction<Operation>;
}) => {
  return (
    <select
      class="border-2 border-gray-400 p-1 my-2"
      value={constant.value.toString()}
      onchange={(e) => {
        setOperationTree(
          ...pathToStorePath(constant.path),
          "value",
          "true" === e.currentTarget.value
        );
      }}
    >
      <option value="true">true</option>
      <option value="false">false</option>
    </select>
  );
};

type And = {
  id: number;
  operandA: Operation;
  operandB: Operation;
  type: "and";
  path: PathPart[];
  value: undefined;
};

const AndView = ({
  and,
  setOperationTree,
  variables,
}: {
  and: And;
  setOperationTree: SetStoreFunction<Operation>;
  variables: Variable[];
}) => {
  return (
    <div>
      <OperationView
        operation={and.operandA}
        setOperationTree={setOperationTree}
        variables={variables}
      />
      <div>AND</div>
      <OperationView
        operation={and.operandB}
        setOperationTree={setOperationTree}
        variables={variables}
      />
    </div>
  );
};

type Or = {
  id: number;
  operandA: Operation;
  operandB: Operation;
  type: "or";
  path: PathPart[];
  value: undefined;
};

const OrView = ({
  or,
  setOperationTree,
  variables,
}: {
  or: Or;
  setOperationTree: SetStoreFunction<Operation>;
  variables: Variable[];
}) => {
  return (
    <div>
      <OperationView
        operation={or.operandA}
        setOperationTree={setOperationTree}
        variables={variables}
      />
      <div>OR</div>
      <OperationView
        operation={or.operandB}
        setOperationTree={setOperationTree}
        variables={variables}
      />
    </div>
  );
};

type Operation = VariableOp | Constant | And | Or | Noop;

const evaluate = (operation: Operation, variables: Variable[]): boolean => {
  if (operation.type == "noop") {
    return false;
  } else if (operation.type == "constant") {
    return operation.value;
  } else if (operation.type == "variable") {
    return variables.find((v) => v.id == operation.value)?.value || false;
  } else if (operation.type == "and") {
    return (
      evaluate(operation.operandA, variables) &&
      evaluate(operation.operandB, variables)
    );
  } else if (operation.type == "or") {
    return (
      evaluate(operation.operandA, variables) ||
      evaluate(operation.operandB, variables)
    );
  } else {
    return false;
  }
};

const ChooseOperationView = ({
  currentOperation,
  setOperationTree,
  variables,
}: {
  currentOperation: Operation;
  setOperationTree: SetStoreFunction<Operation>;
  variables: Variable[];
}) => {
  const generateValue = (type: string): boolean | number | undefined => {
    switch (type) {
      case "constant":
        return false;
      case "variable":
        return variables[0].id;
      default:
        return undefined;
    }
  };

  return (
    <select
      class="border-2 border-gray-400 p-1 my-2 mr-2"
      value={currentOperation.type}
      onchange={(e) => {
        setOperationTree(...pathToStorePath(currentOperation.path), {
          ...currentOperation,
          type: e.currentTarget.value,
          operandA: {
            type: "noop",
            id: operationId++,
            path: [...currentOperation.path, "operandA"],
          },
          operandB: {
            type: "noop",
            id: operationId++,
            path: [...currentOperation.path, "operandB"],
          },
          value: generateValue(e.currentTarget.value),
        } as Operation);
      }}
    >
      <option value="noop">Noop</option>
      <option value="constant">Constant</option>
      <option value="variable">Variable</option>
      <option value="and">And</option>
      <option value="or">Or</option>
    </select>
  );
};

const OperationView = ({
  operation,
  setOperationTree,
  variables,
}: {
  operation: Operation;
  setOperationTree: SetStoreFunction<Operation>;
  variables: Variable[];
}) => {
  return (
    <div classList={{ "ml-8": operation.path.length != 0 }}>
      <ChooseOperationView
        currentOperation={operation}
        setOperationTree={setOperationTree}
        variables={variables}
      />
      <Switch>
        <Match when={operation.type == "noop"}>
          <NoopView
            noop={operation as Noop}
            setOperationTree={setOperationTree}
          />
        </Match>
        <Match when={operation.type == "constant"}>
          <ConstantView
            constant={operation as Constant}
            setOperationTree={setOperationTree}
          />
        </Match>
        <Match when={operation.type == "variable"}>
          <VariableOpView
            variableOp={operation as VariableOp}
            setOperationTree={setOperationTree}
            variables={variables}
          />
        </Match>
        <Match when={operation.type == "and"}>
          <AndView
            and={operation as And}
            setOperationTree={setOperationTree}
            variables={variables}
          />
        </Match>
        <Match when={operation.type == "or"}>
          <OrView
            or={operation as Or}
            setOperationTree={setOperationTree}
            variables={variables}
          />
        </Match>
      </Switch>

      <div>{evaluate(operation, variables).toString()}</div>
    </div>
  );
};

export default function LogicStatementBuilder() {
  let variableInputRef: HTMLInputElement | undefined;

  const [variables, setVariables] = createStore<Variable[]>([
    { id: 10000, name: "var1", value: false },
    { id: 10001, name: "var2", value: true },
  ]);
  const [operationTree, setOperationTree] = createStore<Operation>({
    id: 1000,
    operandA: {
      id: 1001,
      value: true,
      type: "constant",
      path: ["operandA"],
    } as Constant,
    operandB: {
      id: 1002,
      operandA: {
        id: 1003,
        value: false,
        type: "constant",
        path: ["operandB", "operandA"],
      } as Constant,
      operandB: {
        id: 1004,
        value: true,
        type: "constant",
        path: ["operandB", "operandB"],
      } as Constant,
      path: ["operandB"],
      type: "or",
    } as Or,
    type: "and",
    path: [] as PathPart[],
  } as And);

  const addVariable = (name: string) => {
    setVariables(
      produce((mutableVariables) => {
        mutableVariables.push({
          id: ++operationId,
          name: name,
          value: false,
        });
      })
    );
  };
  const updateVariableValue = (id: number, value: boolean) => {
    setVariables(
      (variable) => variable.id === id,
      produce((mutableVariable) => (mutableVariable.value = value))
    );
  };

  const updateVariableName = (id: number, name: string) => {
    setVariables(
      (variable) => variable.id === id,
      produce((mutableVariable) => (mutableVariable.name = name))
    );
  };

  return (
    <>
      <h2 class="text-xl mb-2">Variables</h2>
      <For each={variables}>
        {(variable) => {
          const { id, name, value } = variable;
          return (
            <div class="mb-2">
              <input
                type="text"
                value={name}
                class="border-2 mr-4 p-1"
                onchange={(e) => updateVariableName(id, e.currentTarget.value)}
              />
              <input
                type="checkbox"
                checked={value}
                onchange={(e) =>
                  updateVariableValue(id, e.currentTarget.checked)
                }
              />
            </div>
          );
        }}
      </For>
      <div class="mt-4">
        <input ref={variableInputRef} class="border-2 mr-4 p-1" />
        <button
          class="bg-blue-200 rounded p-2"
          onClick={(e) => {
            if (!variableInputRef?.value.trim()) return;
            addVariable(variableInputRef.value);
            variableInputRef.value = "";
          }}
        >
          Add Variable
        </button>
      </div>
      <div class="mt-4 items-start justify-start text-left">
        <OperationView
          operation={operationTree}
          setOperationTree={setOperationTree}
          variables={variables}
        />
      </div>
      <button
        class="bg-blue-200 rounded p-2 mt-4"
        onclick={(e) => console.log(operationTree)}
      >
        Log Tree
      </button>
      <button
        class="bg-blue-200 rounded p-2 mt-4 ml-4"
        onclick={(e) => console.log(variables)}
      >
        Log variables
      </button>
    </>
  );
}
