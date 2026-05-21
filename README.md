# scaffy

> Opinionated project scaffolding tool with customizable templates for Node.js apps

---

## Installation

```bash
npm install -g scaffy
```

---

## Usage

Create a new project from a built-in or custom template:

```bash
scaffy create my-app --template express-api
```

List available templates:

```bash
scaffy list
```

Use a custom template from a local directory or Git repository:

```bash
scaffy create my-app --template ./my-custom-template
scaffy create my-app --template https://github.com/user/my-template
```

After running, scaffy will scaffold the project structure, install dependencies, and drop you into a ready-to-use setup.

### Example Output

```
✔ Template cloned
✔ Dependencies installed
✔ Project initialized at ./my-app

Happy coding! 🚀
```

---

## Templates

| Name | Description |
|------|-------------|
| `express-api` | Minimal REST API with Express |
| `fullstack` | Node.js + frontend boilerplate |
| `cli-tool` | Starter for CLI applications |

---

## License

[MIT](LICENSE)