#!/bin/bash

cd src/ && npm run build;
cd ..
sam build
sam deploy

