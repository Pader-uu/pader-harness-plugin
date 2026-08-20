# Pader Library Tool for DeepSeek Harness

This installable DeepSeek Harness bundle adds one read-only tool:

```
get_pader_library()
```

It calls Pader's `GET /api/v1/library` endpoint with the user's personal Pader API key and returns exactly two JSON sections to the model:

```json
{
  "likedPapers": [],
  "folderPapers": []
}
```

`likedPapers` contains papers liked directly by the Pader account. `folderPapers` contains papers grouped by folders the account created or saved.

## Security model

- The tool is read-only: it makes only `GET /api/v1/library` requests.
- Keep the personal key out of source control and `cordis.patch.yml`.
- Set `PADER_API_KEY` in the environment that starts Harness. The key is sent only as `X-API-Key` to the configured Pader API base URL.
- Pader stores only a hash of the generated personal API key. Rotate or revoke the key in `Profile -> Settings -> API Access` when needed.

## Install

DeepSeek Harness must be installed first. From this directory, add the local bundle to Harness's Web profile:

```bash
export PADER_API_KEY='pader_pk_replace_with_the_key_from_pader'
pnpm install
dsh plugin --profile web add .
dsh --profile web --dump-config
dsh web
```

The `--dump-config` output should include a `pader-library-tool` layer. In the Web UI, ask the model a request such as:

```
Use my Pader library to list the papers in my saved folders.
```

For a source checkout of DeepSeek Harness, first run `pnpm install` in this plugin directory, then run its launcher from the Harness checkout:

```bash
# Run these two commands from the DeepSeek Harness repository.
pnpm dsh plugin --profile web add /absolute/path/to/pader-harness-plugin
pnpm dsh web
```

## Configuration

The bundle defaults to `https://www.pader.top` and a 15-second timeout. For local backend testing, set the base URL before starting Harness:

```bash
export PADER_API_BASE_URL='http://127.0.0.1:8002'
```

`baseUrl` and `timeoutMs` can also be overridden in a later Cordis configuration layer. The plugin accepts `config.apiKey`, but environment variable `PADER_API_KEY` is preferred so the secret is not persisted in the profile.

## Test

The transport and output-shape tests have no DeepSeek dependencies:

```bash
node --test tests/pader-client.test.js
node --check index.js
```

These tests use a mocked HTTP response. To make a live request, first deploy the Pader backend version containing `GET /api/v1/library` and create a personal API key in the Pader app.
