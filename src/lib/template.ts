import Handlebars from "handlebars";
import path from "path";
import fs from "fs";

export async function renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
  const templatePath = path.join(process.cwd(), "templates", `${templateName}.handlebars`);

  const content = await fs.promises.readFile(templatePath, "utf-8");
  const template = Handlebars.compile(content);

  return template(data);
}
