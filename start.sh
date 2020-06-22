#!/bin/bash

docker build -t archreactor_api .

docker run -p "3000:3000" archreactor_api