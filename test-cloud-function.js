const fetch = require('node-fetch');

async function testCloudFunction() {
    console.log('=== 测试云函数连接 ===');
    
    try {
        // 测试代理服务器
        console.log('1. 测试代理服务器...');
        const healthResponse = await fetch('http://localhost:3000/api/health');
        const healthResult = await healthResponse.json();
        console.log('代理服务器状态:', healthResult);
        
        // 测试云函数调用（模拟真实场景）
        console.log('\n2. 测试云函数调用...');
        
        // 测试1: 没有access_token的情况
        console.log('\n2.1 测试没有access_token的情况...');
        const testData1 = {
            action: 'testConnection'
        };
        
        try {
            const response1 = await fetch('http://localhost:3000/api/cloud-function', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accessToken: '', // 空access_token
                    envId: 'new-travel-2gy6d6oy7ee5fb0e',
                    functionName: 'httpAPI',
                    data: testData1
                })
            });
            
            const result1 = await response1.json();
            console.log('结果1 (无access_token):', result1);
        } catch (error) {
            console.log('测试1失败:', error.message);
        }
        
        // 测试2: 模拟有access_token的情况
        console.log('\n2.2 测试有access_token的情况...');
        const testData2 = {
            action: 'testConnection'
        };
        
        try {
            const response2 = await fetch('http://localhost:3000/api/cloud-function', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accessToken: 'test_token_123', // 模拟access_token
                    envId: 'new-travel-2gy6d6oy7ee5fb0e',
                    functionName: 'httpAPI',
                    data: testData2
                })
            });
            
            const result2 = await response2.json();
            console.log('结果2 (有access_token):', result2);
        } catch (error) {
            console.log('测试2失败:', error.message);
        }
        
        console.log('\n3. 测试完成');
        
    } catch (error) {
        console.error('测试失败:', error.message);
    }
}

// 运行测试
testCloudFunction(); 