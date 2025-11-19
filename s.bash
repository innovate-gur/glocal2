curl -X POST https://api.example.com/v1/jobs \
  -H "Authorization: Bearer $API_KEY" \
  -F "file=@voice.wav" \
  -F "mode=embed" \
  -F "strength=7" \
  -F "robust=true"