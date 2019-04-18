import * as Lint from "tslint";
import * as ts from "typescript";

const ERROR_DUPLICATE_IT = "Duplicate test name found";
const ERROR_DUPLICATE_DESCRIBE = "Duplicate describe name found";

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    description: "Prohibits the use of duplicate it/describe names",
    options: null,
    optionsDescription: "True to activate rule",
    rationale: "This is used to ensure protractor's --grep gets a unique full testname",
    ruleName: "protractor-no-identical-title",
    type: "functionality",
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new UniqueDescribeItWalker(
      sourceFile,
      "protractor-no-identical-title",
      this.getOptions())
    );
  }
}

class UniqueDescribeItWalker extends Lint.AbstractWalker<any> {
  public walk(sourceFile: ts.SourceFile) {
    const matches = {
      describe: [],
      it: [],
    };

    const cb = (node: ts.Node): void => {
      if (!ts.isCallExpression(node)) {
        return ts.forEachChild(node, cb);
      }

      const firstChild = node.getChildAt(0);
      const type = firstChild.getText();

      if (ts.isIdentifier(firstChild) && ["describe", "it"].includes(type)) {
        const titleNode = node.getChildAt(2).getChildAt(0);
        const fullName = this.constructFullName(node.parent, this.getUnquotedText(titleNode));

        if (type === "it" && matches.it.includes(fullName)) {
          this.addFailureAtNode(titleNode, ERROR_DUPLICATE_IT);
        } else if (type === "describe" && matches.describe.includes(fullName)) {
          this.addFailureAtNode(titleNode, ERROR_DUPLICATE_DESCRIBE);
        } else {
          matches[`${type}`].push(fullName);
        }
      }

      return ts.forEachChild(node, cb);
    };
    return ts.forEachChild(sourceFile, cb);
  }

  private constructFullName(node: ts.Node, childNames: string) {
    if (ts.isSourceFile(node)) {
      return childNames;
    }

    if (!ts.isCallExpression(node)) {
      return this.constructFullName(node.parent, childNames);
    } else {
      const firstChild = node.getChildAt(0);
      if (ts.isIdentifier(firstChild) && firstChild.getText() === "describe") {
        const parentName = this.getUnquotedText(node.getChildAt(2).getChildAt(0));

        return this.constructFullName(node.parent, `${parentName} ${childNames}`);
      }
    }
  }

  private getUnquotedText(node: any) {
    return node.text || node.getText().slice(1, -1) || "";
  }
}
