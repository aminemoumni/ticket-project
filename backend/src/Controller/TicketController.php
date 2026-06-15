<?php

namespace App\Controller;

use App\Entity\Ticket;
use App\Repository\TicketRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/tickets')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class TicketController extends AbstractController
{
    private const PRIORITIES = ['low', 'medium', 'high'];
    private const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

    public function __construct(
        private TicketRepository $ticketRepository,
        private EntityManagerInterface $em,
    ) {}

    #[Route('', name: 'ticket_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true);

        if (empty($body['title']) || empty($body['description'])) {
            return $this->json(['message' => 'Title and description are required'], 400);
        }

        $priority = $body['priority'] ?? 'medium';
        if (!in_array($priority, self::PRIORITIES, true)) {
            return $this->json(['message' => 'Invalid priority'], 400);
        }

        $ticket = new Ticket();
        $ticket->setTitle($body['title']);
        $ticket->setDescription($body['description']);
        $ticket->setPriority($priority);
        $ticket->setUser($this->getUser());

        $this->em->persist($ticket);
        $this->em->flush();

        return $this->json($this->serialize($ticket), 201);
    }

    #[Route('', name: 'ticket_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        $roles = $user->getRoles();

        if (in_array('ROLE_ADMIN', $roles) || in_array('ROLE_AGENT', $roles)) {
            $tickets = $this->ticketRepository->findAll();
        } else {
            $tickets = $this->ticketRepository->findBy(['user' => $user]);
        }

        return $this->json(array_map(fn($t) => $this->serialize($t), $tickets));
    }

    #[Route('/{id}', name: 'ticket_get', methods: ['GET'])]
    public function get(int $id): JsonResponse
    {
        $ticket = $this->ticketRepository->find($id);

        if (!$ticket) {
            return $this->json(['message' => 'Ticket not found'], 404);
        }

        if (!$this->canAccess($ticket)) {
            return $this->json(['message' => 'Access denied'], 403);
        }

        return $this->json($this->serialize($ticket));
    }

    #[Route('/{id}', name: 'ticket_update', methods: ['PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $ticket = $this->ticketRepository->find($id);

        if (!$ticket) {
            return $this->json(['message' => 'Ticket not found'], 404);
        }

        if (!$this->canAccess($ticket)) {
            return $this->json(['message' => 'Access denied'], 403);
        }

        $body = json_decode($request->getContent(), true);
        $user = $this->getUser();
        $roles = $user->getRoles();
        $isAgentOrAdmin = in_array('ROLE_ADMIN', $roles) || in_array('ROLE_AGENT', $roles);

        if (isset($body['priority']) && !in_array($body['priority'], self::PRIORITIES, true)) {
            return $this->json(['message' => 'Invalid priority'], 400);
        }
        if (isset($body['status']) && $isAgentOrAdmin && !in_array($body['status'], self::STATUSES, true)) {
            return $this->json(['message' => 'Invalid status'], 400);
        }

        if (isset($body['title'])) $ticket->setTitle($body['title']);
        if (isset($body['description'])) $ticket->setDescription($body['description']);
        if (isset($body['priority'])) $ticket->setPriority($body['priority']);
        if (isset($body['status']) && $isAgentOrAdmin) $ticket->setStatus($body['status']);

        $this->em->flush();

        return $this->json($this->serialize($ticket));
    }

    #[Route('/{id}', name: 'ticket_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $ticket = $this->ticketRepository->find($id);

        if (!$ticket) {
            return $this->json(['message' => 'Ticket not found'], 404);
        }

        if (!$this->canAccess($ticket)) {
            return $this->json(['message' => 'Access denied'], 403);
        }

        $this->em->remove($ticket);
        $this->em->flush();

        return $this->json(null, 204);
    }

    private function canAccess(Ticket $ticket): bool
    {
        $user = $this->getUser();
        $roles = $user->getRoles();

        return $ticket->getUser() === $user
            || in_array('ROLE_ADMIN', $roles)
            || in_array('ROLE_AGENT', $roles);
    }

    private function serialize(Ticket $ticket): array
    {
        return [
            'id'          => $ticket->getId(),
            'title'       => $ticket->getTitle(),
            'description' => $ticket->getDescription(),
            'priority'    => $ticket->getPriority(),
            'status'      => $ticket->getStatus(),
            'createdAt'   => $ticket->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt'   => $ticket->getUpdatedAt()?->format('Y-m-d H:i:s'),
            'user'        => [
                'id'        => $ticket->getUser()->getId(),
                'email'     => $ticket->getUser()->getEmail(),
                'firstName' => $ticket->getUser()->getFirstName(),
                'lastName'  => $ticket->getUser()->getLastName(),
            ],
        ];
    }
}
