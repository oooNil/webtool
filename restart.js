const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;
const path = require('path');
const cors = require('cors');

const corsOptions = {
  origin: '*',
  methods:
  'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionSuccessStatus: 204
};

const currentDir = __dirname;
const frontendDir = path.resolve(currentDir, './public');
app.use(express.static(frontendDir));
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

//
app.use(express.json());

//
const ALLOWED_ENVS = ['ibas', 'int', 'int2'];
const ALLOWED_COMPONENTS = [
  'pnst', 'smps', 'lpcs', 'fila', 'lum', 'odsgover', 
  'rtfs', 'ocd', 'oce', 'ocw', 'oct2', 'ocz', 'ocbb'
];

//
app.post('/restart-amq', async (req, res) => {
  const { env, component } = req.body;

  //
  if (!ALLOWED_ENVS.includes(env)) {
    return res.status(400).json({ error: 'Invalid environment' });
  }
  
  if (!ALLOWED_COMPONENTS.includes(component)) {
    return res.status(400).json({ error: 'Invalid component' });
  }

  const namespace = `${env}-${component}`;
  const routeName = `${component}-amq-wconsj-0-svc-rte`;
  
  try {
    console.log(`1 ${routeName}`);
    //
    const routeJson = exec(`oc get route ${routeName} -n ${namespace} -o json`);
    console.log(`2 \n${routeJson}`);
    const route = JSON.parse(routeJson);
    console.log(`3`);
    
    //
    await executeCommand(`oc patch ActiveMQArtemis ${component}-amq -n ${namespace} -p '{"spec":{"deploymentPlan":{"size":0}}}' --type merge`);
    
    //
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    //
    await executeCommand(`oc patch ActiveMQArtemis ${component}-amq -n ${namespace} -p '{"spec":{"deploymentPlan":{"size":1}}}' --type merge`);

    //
    if (route.metadata?.ownerReferences){
      console.log(`[${routeName}] Found ownerReferences, will remove`);
      await executeCommand(`oc patch route ${component}-amq-wconsj-0-svc-rte -n ${namespace} --type=json -p='[{"op": "remove", "path": "/metadata/ownerReferences"}]'`);
      console.log(`\n[${routeName}] Successfully updated route configuration`);
    }
    else{
      console.log(`[${routeName}] No ownerReferences found, skipping removal`);
    }
    await executeCommand(`oc patch route ${component}-amq-wconsj-0-svc-rte -n ${namespace} --type=merge -p '{"spec": {"tls": {"termination": "edge", "insecureEdgeTerminationPolicy": "Allow"}}}'`);
    console.log(`\n[${routeName}] Successfully updated route configuration`);
    
    res.json({ 
      success: true,
      message: `AMQ restart for ${namespace} completed successfully`
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'AMQ restart failed',
      details: error.message
    });
  }
});

// 
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Command failed: ${stderr || error.message}`));
        return;
      }
      resolve(stdout);
    });
  });
}

// 
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
