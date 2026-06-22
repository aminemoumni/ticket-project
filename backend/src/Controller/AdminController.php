<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $em,
    ) {}

    #[Route('/users', name: 'admin_users_list', methods: ['GET'])]
    public function listUsers(): JsonResponse
    {
        $users = $this->userRepository->findAll();

        $data = array_map(fn(User $u) => [
            'id'        => $u->getId(),
            'email'     => $u->getEmail(),
            'firstName' => $u->getFirstName(),
            'lastName'  => $u->getLastName(),
            'roles'     => $u->getRoles(),
        ], $users);

        return $this->json($data);
    }

    #[Route('/users/{id}/role', name: 'admin_users_update_role', methods: ['PATCH'])]
    public function updateRole(int $id, Request $request): JsonResponse
    {
        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'User not found'], 404);
        }

        if ($user === $this->getUser()) {
            return $this->json(['message' => 'You cannot change your own role'], 400);
        }

        $body = json_decode($request->getContent(), true);
        $role = $body['role'] ?? null;

        $allowed = ['ROLE_USER', 'ROLE_AGENT', 'ROLE_ADMIN'];
        if (!in_array($role, $allowed, true)) {
            return $this->json(['message' => 'Invalid role'], 400);
        }

        $user->setRoles([$role]);
        $this->em->flush();

        return $this->json(['message' => 'Role updated', 'roles' => $user->getRoles()]);
    }
}
