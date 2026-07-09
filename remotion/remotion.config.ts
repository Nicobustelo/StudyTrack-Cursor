import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Windows: mantener la concurrencia moderada para no saturar CPU.
// (Los dos videos se renderizan de forma SECUENCIAL, nunca en paralelo.)
Config.setConcurrency(4);
