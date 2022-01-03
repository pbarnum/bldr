import Output from "../models/output";
import Template from "../models/template";
import * as path from "path";

export interface GeneratorOptions {
  name?: string;
  template?: Template;
  output?: Output;
}

export default class Generator {
  public name: string;
  private _output: string;
  private templateModel: Template | undefined;
  private outputModel: Output | undefined;
  private amountReplaced = 0;
  static variableRegex = /\{[\w-.]+\}/gm;

  constructor(o: GeneratorOptions) {
    if (!o.output && !o.template) {
      throw "bad arguments: Generator requires either an Output or a Template";
    }

    this._output = "";
    this.name = o.name || o.output?.name || o.template?.name || "New Output";
    this.templateModel = o.template;
    this.outputModel = o.output;

    if (this.outputModel) {
      this.amountReplaced = this.outputModel.amountReplaced;
    }
  }

  fileName() {
    let ext = ".txt";
    if (path.extname(this.name) !== "") {
      ext = "";
    }
    return this.name + ext;
  }

  generate(variables: { [key: string]: string }): void {
    if (!this.templateModel) {
      throw "invalid state: Template required to process variables";
    }

    console.log(variables);

    let compiledData = this.templateModel.contents;
    Object.keys(variables).forEach((k: unknown) => {
      const found = (compiledData.match(Generator.variableRegex) || []).length;
      this.amountReplaced += found;

      if (found > 0) {
        compiledData = compiledData
          .split(k as string)
          .join(variables[k as string]);
      }
    });

    this._output = compiledData;
  }

  get replaced(): number {
    return this.amountReplaced;
  }

  get output(): string {
    if (this._output !== "") {
      return this._output;
    }

    if (this.outputModel) {
      return this.outputModel.contents;
    }

    return "";
  }
}
