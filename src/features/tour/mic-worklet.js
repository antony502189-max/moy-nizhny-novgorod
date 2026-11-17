class Microphone extends AudioWorkletProcessor {
  process(input) {
    const samples=input[0]?.[0];
    if(samples?.length)this.port.postMessage(samples.slice());
    return true;
  }
}
registerProcessor('tour-microphone',Microphone);
