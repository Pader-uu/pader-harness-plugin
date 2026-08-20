# Pader Library Tool for DeepSeek Harness

Pader is an iOS app for discovering, collecting, and organizing research papers through a personalized feed. Learn more at [www.pader.top](https://www.pader.top).

This installable DeepSeek Harness bundle adds one read-only tool:

```
get_pader_library()
```

It returns exactly two JSON sections to the model:

```json
{
  "likedPapers": [],
  "folderPapers": []
}
```

`likedPapers` contains papers liked directly by the Pader account. `folderPapers` contains papers grouped by folders the account created or saved.

## Security model

- The tool is read-only.
- Keep the personal key out of source control and `cordis.patch.yml`.
- Set `PADER_API_KEY` in the environment that starts Harness. 
- Pader stores only a hash of the generated personal API key. Rotate or revoke the key in `Profile -> Settings -> API Access` when needed.

## Install

DeepSeek Harness must be installed first. From this directory, add the local bundle to Harness's Web profile:

```bash
export PADER_API_KEY='pader_pk_replace_with_the_key_from_pader'
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
```

Then,

```bash
# Run these two commands from the DeepSeek Harness repository.
pnpm dsh plugin --profile web add /absolute/path/to/pader-harness-plugin
pnpm dsh web
```

In the Web UI, ask the model a request such as:

```
Use my Pader library to list the papers in my saved folders.
```
