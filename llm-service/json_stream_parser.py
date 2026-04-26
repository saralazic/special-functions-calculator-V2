import json

def parse_stream_json(stream_json):
    """
    Reads stream JSON from string or list of dictionaries, returns combined text from response field.

    :param stream_json: string/dicts which contain json stream
    :return: text from response
    """
    if isinstance(stream_json, str):
        try:
            data = json.loads(stream_json)
        except json.JSONDecodeError:
            data = []
            for line in stream_json.strip().splitlines():
                data.append(json.loads(line))
    else:
        data = stream_json
    
    combined_text = "".join(item.get("response", "") for item in data)
    return combined_text