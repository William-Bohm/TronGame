import * as ort from 'onnxruntime-web';  // Change this to 'onnxruntime-web'

let modelSession = null;

export async function initializeModelSession() {
  try {
    modelSession = await ort.InferenceSession.create('/tron_model_v2.onnx');
    console.log('Model initialized successfully');
    return true;
  } catch (err) {
    console.error('Failed to initialize model session:', err);
    return false;
  }
}

export async function getModelMoveSuggestion(input, shape) {
  if (!modelSession) {
    throw new Error('Model session not initialized');
  }

  const tensor = new ort.Tensor('float32', input, shape);
  const feeds = { 'input': tensor };
  const results = await modelSession.run(feeds);
  return results['output'].data[0];
}