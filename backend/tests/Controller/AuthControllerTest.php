<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AuthControllerTest extends WebTestCase
{
    public function testRegisterSuccess(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/auth/register', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([
            'email' => 'newuser@test.com',
            'password' => 'password123',
            'firstName' => 'New',
            'lastName' => 'User',
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('user', $data);
        $this->assertEquals('newuser@test.com', $data['user']['email']);
    }

    public function testRegisterDuplicateEmail(): void
    {
        $client = static::createClient();

        $payload = json_encode([
            'email' => 'duplicate@test.com',
            'password' => 'password123',
            'firstName' => 'Test',
            'lastName' => 'User',
        ]);

        $client->request('POST', '/api/auth/register', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], $payload);

        $client->request('POST', '/api/auth/register', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], $payload);

        $this->assertResponseStatusCodeSame(409);
    }

    public function testLoginSuccess(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/auth/register', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([
            'email' => 'login@test.com',
            'password' => 'password123',
            'firstName' => 'Login',
            'lastName' => 'User',
        ]));

        $client->request('POST', '/api/auth/login', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([
            'email' => 'login@test.com',
            'password' => 'password123',
        ]));

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('token', $data);
    }
}
