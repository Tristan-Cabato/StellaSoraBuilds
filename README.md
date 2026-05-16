## I should probably transfer these json files to another endpoint instead of constantly committing (bad practice). Though the only database I know that runs for free is supabase which needs activity every 7 days to stay on. I'll see if I get a smarter alternative later.

### Maintaining the Shimiao agenda is top priority, we'll get that alt soon, trust.
![Shimiao](https://images.steamusercontent.com/ugc/16046413504441829626/3439079471A06201ACD97590D2518D43ACB14454/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true)

## Data Handler Attempts
1.) Google Spreadsheets via SheetDB
    - Too many parsing and formatting errors
    - JSON contains array of objects which adds an extra layer of data reading
2.) JSON writing helper
    - HTML can't write to local files directly
    - Attempted a python server to bypass it, still had errors