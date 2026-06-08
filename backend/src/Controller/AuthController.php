<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface $validator,
        private UserRepository $userRepository,
    ) {}

    #[Route('/register', name: 'auth_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['password'], $data['firstName'], $data['lastName'])) {
            return $this->json(['error' => 'Missing required fields'], 400);
        }

        $errors = [];
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email address';
        }
        if (strlen((string) $data['password']) < 8) {
            $errors['password'] = 'Password must be at least 8 characters';
        }
        if (trim((string) $data['firstName']) === '') {
            $errors['firstName'] = 'First name is required';
        }
        if (trim((string) $data['lastName']) === '') {
            $errors['lastName'] = 'Last name is required';
        }
        if ($errors) {
            return $this->json(['errors' => $errors], 422);
        }

        if ($this->userRepository->findOneBy(['email' => $data['email']])) {
            return $this->json(['error' => 'Email already in use'], 409);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);
        $user->setRoles(['ROLE_USER']);
        $user->setPassword(
            $this->passwordHasher->hashPassword($user, $data['password'])
        );

        $violations = $this->validator->validate($user);
        if (count($violations) > 0) {
            $messages = [];
            foreach ($violations as $violation) {
                $messages[$violation->getPropertyPath()] = $violation->getMessage();
            }
            return $this->json(['errors' => $messages], 422);
        }

        $this->em->persist($user);
        $this->em->flush();

        return $this->json([
            'message' => 'User registered successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
            ]
        ], 201);
    }
}
