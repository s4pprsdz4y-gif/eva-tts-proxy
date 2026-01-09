// Eva Mailbox Generator - Vercel Serverless Function
// api/elevenlabs.js

const ELEVENLABS_API_KEY = 'sk_d55f3e07067444757811b2844dc395bca8e76e37e6c542df';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET (test endpoint)
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      message: 'Eva Mailbox Generator - ElevenLabs Proxy Active ✅',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle POST
  if (req.method === 'POST') {
    try {
      const { text, voice_id } = req.body;

      console.log('🎙️ Generiere Sprache');
      console.log('📝 Text:', text?.substring(0, 50));
      console.log('🎤 Voice ID:', voice_id);

      // Validate input
      if (!text || !voice_id) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'text and voice_id are required',
        });
      }

      // Call ElevenLabs API
      const elevenlabsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!elevenlabsResponse.ok) {
        const errorText = await elevenlabsResponse.text();
        console.error('❌ ElevenLabs Error:', elevenlabsResponse.status, errorText);
        
        return res.status(elevenlabsResponse.status).json({
          error: `ElevenLabs API error: ${elevenlabsResponse.status}`,
          message: errorText,
        });
      }

      // Get audio data
      const audioBuffer = await elevenlabsResponse.arrayBuffer();
      console.log('✅ Audio generiert:', audioBuffer.byteLength, 'bytes');

      // Return audio
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.byteLength.toString());
      return res.status(200).send(Buffer.from(audioBuffer));

    } catch (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({
        error: 'Server error',
        message: error.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
