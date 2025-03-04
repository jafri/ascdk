import os
import sys
import json
import struct

test_dir = os.path.dirname(__file__)
sys.path.append(os.path.join(test_dir, '..'))

from ipyeos import log
from ipyeos.chaintester import ChainTester

logger = log.get_logger(__name__)

chain = ChainTester()

def test_ts():
    # info = chain.get_account('helloworld11')
    # logger.info(info)
    with open('./assembly/target/target.wasm', 'rb') as f:
        code = f.read()
    chain.deploy_contract('hello', code, b'', 0)
    args = struct.pack('II', 11, 22)
    r = chain.push_action('hello', 'dec2', args, {'hello': 'active'})

    r = chain.push_action('hello', 'zzzzzzzzzzzz', args, {'hello': 'active'})
