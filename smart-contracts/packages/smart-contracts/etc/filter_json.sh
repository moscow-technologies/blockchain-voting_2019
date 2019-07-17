#!/bin/bash

set -e

jq '{abi: .abi, bytecode: .bytecode}' "$1" > tmpfile && mv tmpfile "$1"
